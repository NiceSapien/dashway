const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PersonalInfo = sequelize.define('PersonalInfo', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedData: {
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

  PersonalInfo.associate = (models) => {
    PersonalInfo.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  return PersonalInfo;
};

