// Utility function to generate consistent colors for collaborative editing users
export const generateUserColor = (userId: string): string => {
  // A predefined set of pleasing colors for collaboration
  const colors = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Peach Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9', // Light Blue
    '#F8C471', // Light Orange
    '#82E0AA', // Light Green
  ];

  // Generate a consistent hash from userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};
