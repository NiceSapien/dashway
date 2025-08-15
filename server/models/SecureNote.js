const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SecureNote = sequelize.define('SecureNote', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authTag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  SecureNote.associate = (models) => {
    SecureNote.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  return SecureNote;
};

