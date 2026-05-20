import express from 'express';

const server = express ();


server.get('/3Info', (req, res)=>{
res.status(200).json({
  error: false,
  message: '3InfoB API',
});
});

server.get('/', (req, res)=>{
  res.send('Servidor Ligado!');
});

server.listen(3000, ()=>{
  console.log('Server on.')
});