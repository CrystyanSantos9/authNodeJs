const LocalStrategy = require('passport-local').Strategy //a estrategia que usaremos para autenticar
const bcrypt = require('bcrypt') //para checar se a senha bate com o hash salvo


 function initialize(passport,getUserByEmail,getUserById){  

    //funcao que pegará os parâmentros que serão usados para autenticar
    const authenticateUser =  async (email, password, done)=>{
        //funcao que buscará dentro dos dados persistitos
        //o dados correspondente ao que o usuário vai passar
        const user = getUserByEmail(email)

        //se não dar match no usurário
        if(user==null){
            return done(null, false, {message:'Não há nenhum usuário com este email.'})
        }
        //dando certo
        try{
            //verifica se a senha corresponde ao hash criado para
            //ela durante a fase de criacao no banco de dados
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            }else{
                return done(null, false, {message:'Senha incorreta!'})
            }
        }catch (error){
            return done(error)
        }
    }

    //metodo que criará um novo objeto de autenticacao
    //contem o campo que será usado e a funcao com os campos
    //enviados pelo usuario
    passport.use(new LocalStrategy({usernameField:'email'},
    authenticateUser))
    //metodos usados para armazenar / remover
    //os dados de autenticação na sessão do usuário
    passport.serializeUser((user, done)=> done(null, user.id))
    passport.deserializeUser((id, done)=>{
        return done(null, getUserById(id))
    })

    
}

//exportando o uso da nossa funcao para outros arquivos do nosso app
module.exports = initialize