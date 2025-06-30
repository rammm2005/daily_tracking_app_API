const express = require('express');
const router = express.Router();
const axios = require('axios');
const ChatSession = require('../model/ChatSession');
const Message = require('../model/Message');
const User = require('../model/User');
const DailyTracking = require('../model/progress');
const Schedule = require('../model/reminder');
const Goal = require('../model/goal');

const getSuggestions = () => [
    "Apa perkembangan goal-ku minggu ini?",
    "Tolong buatkan jadwal latihan hari ini",
    "Rekomendasikan makanan sehat dong",
];

router.post('/chat', async (req, res) => {
    const { userId, message } = req.body;

    try {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ error: 'User tidak ditemukan atau tidak valid.' });
        }

        if (!message) {
            return res.json({ reply: "", suggestions: getSuggestions() });
        }

        let session = await ChatSession.findOne({ userId }).populate('messages');
        if (!session) {
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            session = await ChatSession.create({
                userId,
                title,
                messages: []
            });
        }

        const userMsg = await Message.create({
            userId,
            role: 'user',
            content: message,
        });

        session.messages.push(userMsg._id);
        await session.save();

        const messages = await Message.find({ userId }).sort({ timestamp: 1 });
        const chatHistory = messages.map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.content,
        }));

        const [trackingData, scheduleData, goalsData] = await Promise.all([
            DailyTracking.find({ userId }),
            Schedule.find({ userId }),
            Goal.find({ userId }),
        ]);

        const contextData = `
Berikut data pengguna:
- Goals:
${goalsData.length > 0 ? goalsData.map(goal => `  • ${goal.title}: ${goal.description}`).join('\n') : '  • Tidak ada goal'}

- Schedule:
${scheduleData.length > 0 ? scheduleData.map(s => `  • ${s.title} pada ${new Date(s.date).toLocaleDateString('id-ID')}`).join('\n') : '  • Tidak ada jadwal'}

- Daily Tracking:
${trackingData.length > 0 ? trackingData.map(d => `  • ${new Date(d.date).toLocaleDateString('id-ID')}: workout=${d.workout}, mood=${d.mood}, tidur=${d.sleepHours} jam`).join('\n') : '  • Tidak ada data tracking'}
`;

        chatHistory.unshift({
            role: "system",
            content: `Kamu adalah asisten daily tracking pribadi yang membantu pengguna mencapai goal mereka dengan saran workout, jadwal, dan motivasi harian.\n\n${contextData}`
        });

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3-8b-instruct',
                messages: chatHistory,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const botReply = response.data.choices[0].message.content;

        const botMsg = await Message.create({
            userId,
            role: 'bot',
            content: botReply,
        });

        session.messages.push(botMsg._id);
        await session.save();

        res.json({ reply: botReply, suggestions: getSuggestions() });

    } catch (error) {
        console.error('Chatbot Error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Gagal memproses chat.' });
    }
});


router.get('/chat/session/:sessionId/messages', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await ChatSession.findById(sessionId).populate('messages');
        if (!session) {
            return res.status(404).json({ messages: [] });
        }

        res.json({ messages: session.messages });
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(500).json({ messages: [] });
    }
});


router.get('/chat/sessions/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const sessions = await ChatSession.find({ userId })
            .populate('messages')
            .sort({ startedAt: -1 });

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching sessions:', error.message);
        res.status(500).json({ success: false, error: 'Gagal mengambil session.' });
    }
});


router.delete('/chat/messages', async (req, res) => {
    const { userId, messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'messageIds harus berupa array dengan setidaknya satu ID.' });
    }

    try {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ error: 'User tidak ditemukan atau tidak valid.' });
        }

        const validMessages = await Message.find({
            _id: { $in: messageIds },
            userId
        });

        if (validMessages.length === 0) {
            return res.status(404).json({ error: 'Tidak ada pesan valid ditemukan untuk user ini.' });
        }

        const validIds = validMessages.map(msg => msg._id);

        await Message.deleteMany({ _id: { $in: validIds } });

        await ChatSession.findOneAndUpdate(
            { userId },
            { $pull: { messages: { $in: validIds } } }
        );

        res.json({ message: 'Pesan berhasil dihapus.', deletedCount: validIds.length });

    } catch (error) {
        console.error('Delete Selected Messages Error:', error.message);
        res.status(500).json({ error: 'Gagal menghapus pesan.' });
    }
});


module.exports = router;
