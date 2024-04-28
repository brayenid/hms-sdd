const Service = require('node-windows').Service

// Create a new service object
const svc = new Service({
  name: 'HMS',
  description: 'HMS server.',
  script: 'C:\\Users\\braye\\Documents\\Temp Storage\\Web Stuff\\hms\\index.js',
  nodeOptions: ['--harmony', '--max_old_space_size=4096']
  //, workingDirectory: '...'
  //, allowServiceLogon: true
})

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall', function () {
  svc.start()
})

svc.uninstall()
