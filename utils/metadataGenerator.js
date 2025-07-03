function generateNFTMetadata(name, description, imageUrl, attributes = []) {
  const defaultAttributes = [
    { trait_type: "verified", value: "Yes" },
    { trait_type: "registrationDate", value: new Date().toISOString().split('T')[0] }
  ];

  return {
    name,
    description,
    image: imageUrl,
    attributes: [...defaultAttributes, ...attributes],
    external_url: process.env.BASE_URL || "https://snap-backend-0ewf.onrender.com",
    background_color: "ffffff"
  };
}

module.exports = {
  generateNFTMetadata
};