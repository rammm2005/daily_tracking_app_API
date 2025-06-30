const express = require('express');
const router = express.Router();
const axios = require('axios');
const ChatSession = require('../model/ChatSession');
const Message = require('../model/Message');
const User = require('../model/User');

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
            session = await ChatSession.create({ userId, messages: [] });
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

        chatHistory.unshift({
            role: "system",
            content: "Kamu adalah asisten daily tracking pribadi yang membantu pengguna mencapai goal mereka dengan saran workout, jadwal, dan motivasi harian.",
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
