let app = require('../src/app');
let supertest = require('supertest');
let request = supertest(app);

let mainUser = {
  name: 'Matheus',
  email: 'email@teste.com',
  password: 'senha123',
};

beforeAll(() => {
  // cria um usuário antes de iniciar todos os testes
  return request
    .post('/user')
    .send(mainUser)
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
});

afterAll(() => {
  // remove o usuário Matheus do banco de dados após o término de todos os testes
  return request
    .delete(`/user/${mainUser.email}`)
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
});

describe('Cadastro de usuário', () => {
  test('Deve cadastrar um usuário com sucesso!', () => {
    let time = Date.now();
    let email = `${time}@teste.com`;

    let user = {
      name: 'Matheus',
      email,
      password: '12345',
    };

    return request
      .post('/user')
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual(email);
      })
      .catch((err) => {
        fail(err);
      });
  });

  test('Deve impedir que o usuário se cadastre com dados vazios', () => {
    let user = {
      name: '',
      email: '',
      password: '',
    };

    return request
      .post('/user')
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(400); // Bad Request
      })
      .catch((err) => {
        fail(err);
      });
  });

  test('Deve impedir que o usuário se cadastre com email repetido', () => {
    let time = Date.now();
    let email = `${time}@teste.com`;

    let user = {
      name: 'Matheus',
      email,
      password: '12345',
    };

    return request
      .post('/user')
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual(email);

        return request
          .post('/user')
          .send(user)
          .then((res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('E-mail já cadastrado!');
          })
          .catch((err) => {
            fail(err);
          });
      })
      .catch((err) => {
        fail(err);
      });
  });
});

describe('Autenticação de usuário', () => {
  test('Deve retornar um token quando logar', () => {
    return request
      .post('/auth')
      .send({ email: mainUser.email, password: mainUser.password })
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
      })
      .catch((err) => {
        fail(err);
      });
  });

  test('Deve impedir que um usuário não cadastrado consiga fazer login', () => {
    return request
      .post('/auth')
      .send({ email: 'umemail@qualquer.com', password: 'com_uma_senha_errada' })
      .then((res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.email).toEqual('E-mail não cadstrado!');
      })
      .catch((err) => {
        fail(err);
      });
  });

  test('Deve impedir que um usuário não cadastrado consiga fazer login com uma senha errada', () => {
    return request
      .post('/auth')
      .send({ email: mainUser.email, password: 'com_uma_senha_errada' })
      .then((res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.password).toEqual('Senha incorreta!');
      })
      .catch((err) => {
        fail(err);
      });
  });
});
