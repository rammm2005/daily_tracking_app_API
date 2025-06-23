function extractPublicId(url) {
    try {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1];
        const publicId = fileName.split('.')[0];
        return `meals/${publicId}`;
    } catch (err) {
        console.error('Gagal extract publicId dari URL:', url);
        return null;
    }
}

module.exports = {
    extractPublicId
};
