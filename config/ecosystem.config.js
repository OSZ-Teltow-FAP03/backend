module.exports = {
	apps: [
		{
			name: 'Server',
			namespace: 'Backend',
			script: 'index.js',
			watch: '.',
			cron_restart: '0 0 * * *',
			out_file: './dev/log/child-out.log',
			error_file: './dev/log/child-err.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			merge_logs: true,
			log_type: '', 
			watch: true,
		}
	],
	deploy: {
		production: {
			user: 'SSH_USERNAME',
			host: 'SSH_HOSTMACHINE',
			ref: 'origin/master',
			repo: 'GIT_REPOSITORY',
			path: 'DESTINATION_PATH',
			'pre-deploy-local': '',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
			'pre-setup': ''
		}
	}
};


// max_memory_restart: "150M",
//  merge_logs: true