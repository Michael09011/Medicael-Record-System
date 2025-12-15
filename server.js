const { app, sequelize } = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
	await sequelize.sync();
	app.listen(PORT, () => {
		console.log(`EMR backend listening on port ${PORT}`);
	});
}

start().catch(err => {
	console.error('Failed to start server:', err);
});
