import express from 'express';

const server = express ();

const users = [
  {id: 1, name: 'John Doe', gender: 'm'},
  {id: 2, name: 'Jane Doe', gender: 'f'},
  {id: 3, name: 'Bob Smith', gender: 'm'},
  {id: 4, name: 'Alice Johnson', gender: 'f'},
  {id: 5, name: 'Tom Wilson', gender: 'm'},
];

  server.get('/users', (req, res)=>{
    return res.status(200).json({
      error: false,
      message: 'Users List',
      result: users
    });
  });

  server.get('/users/:id', (req, res)=>{
  });
  
  server.get('/users/:id', (req, res)=>{
    const {id} = req.params;
    const user = users.find(u => u.id === parseInt(id));

    if(!user){
      return res.status(404).json({
        error: true,
        message: 'User Not Found',
        result: null
      });
    }
    return res.status(200).json({
      error: false,
      message: 'User Found',
      result: user
    });
  });

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