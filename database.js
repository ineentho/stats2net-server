'use strict';

const co = require('co'),
      Sequelize = require('sequelize');


/**
 * Find appropriate credentials depending on environment variables
 */
const db = {
    database: process.env.DATABASE || 'flygfiskstats',
    username: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'flygfisk',
    password: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || 'sten123',
    host: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost',
    port: process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432
};

/**
 * Create a sequelize session based on the above credentials
 */
const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host,
    port: db.port,
    dialect: 'postgres'
});

/**
 * Load the models
 */
const Player = require('./models/player')(sequelize);

/**
 * Sync all model tables
 */
function *syncDbs() {
    yield Player.sync({force: true});
}

module.exports = {
    sequelize: sequelize,
    sync: syncDbs,

    // Export all database models
    Player: Player
};