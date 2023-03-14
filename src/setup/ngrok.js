import args from 'args'
import ngrok from 'ngrok'

args
  .option('port', 'The port ngrok forward to', 8080)
  .option('region', 'The ngrok server region', 'us') // us, eu, au, ap, sa, jp, in

const { port, region } = args.parse(process.argv)

ngrok
  .connect({
    proto: 'http',
    addr: port,
    region: region,
    onStatusChange: (status) => {
      console.log(status)
    },
  })
  .then((url) => {
    console.log(url)
  })
