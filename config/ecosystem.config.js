module.exports = {
	apps: [
		{
			name: 'server',
			namespace: 'Backend',
			script: 'index.js',
			watch: '.',
			cron_restart: '0 0 * * *',
			out_file: './dev/log/child-out.log',
			error_file: './dev/log/child-err.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			merge_logs: true,
			log_type: '',
			watch: true
		}
	]
};

// max_memory_restart: "150M",
//  merge_logs: true
