//importa nosso módulo que lida com as variáveis de ambiente
//caso estejamos em um ambiente de desenvolvimento
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    //funcao que checa nos dados armazenados e busca pelo email correspondente
    //poderia existir uma conexão com o banco aqui
    email => users.find(user=>user.email===email),
    id => users.find(user=>user.id===id)
)

//persistencia / dado que seria salvo no banco de dados
const users = []


app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET, //variavel de ambiente que fica dentro de .env
    resave:false, 
    saveUninitialized:false
}))
app.use(passport.initialize())//configura algumas lógicas básicas para nós 
app.use(passport.session())
app.use(methodOverride('_method'))



//GET main page
app.get('/', checkAuthenticated, (req, res)=>{
    
    res.render('index.ejs',{name:"Crystyan"})

})

//GET Login 
app.get('/login',(req, res)=>{
    res.render('login.ejs')
})

//POST Login
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    // se tudo correu bem
    successRedirect:'/', 
    failureRedirect: '/login', //mantém na tela de login
    failureFlash: true
}))

//GET Register
app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})

//POST Register
app.post('/register', async (req, res)=>{
    try{
        //faz o hash da nossa senha antes de persistir
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //aqui faríamos a conexao com o bd 
        users.push({
            id:Date.now().toString(), //timestamp
            name:req.body.name, 
            email:req.body.email, 
            password:hashedPassword //password criptografado
        })
        //se tudo certo vamos para a tela de /login
        res.redirect('/login')
    }catch { //caso dê erro somos voltamos para tela de /register
        res.redirect('/register')
    }
    //mostra os dados persistidos
    console.log(users)
})


app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }



app.listen(3000)