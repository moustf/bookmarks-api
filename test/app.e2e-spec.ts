import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:8888');

    await app.init();
    await app.listen(8888);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth Routes Testing', () => {
    const dto: AuthDto = {
      email: 'moustf@gmail.com',
      password: '123',
    };
    describe('Signup Route Testing', () => {
      it('Should not signup if the email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: '', password: dto.password })
          .expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should not signup if the password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email, password: '' })
          .expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should not signup if neither the password nor the email are provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login Route Testing', () => {
      it('Should not login if the email is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: '', password: dto.password })
          .expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should not login if the password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: dto.email, password: '' })
          .expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should not login if neither the password nor the email are provided', () => {
        return pactum.spec().post('/auth/login').withBody({}).expectStatus(400); // ? Throw by the validation pipe.
      });

      it('Should Login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });
    });
  });

  describe('User Routes Testing', () => {
    describe('Get Current User Route Testing', () => {
      it('should get the current user who signed in', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200);
      });

      describe('Edit User Route Testing', () => {
        const dto: EditUserDto = {
          firstName: 'Mustafa',
          email: 'moustf@moustf.moustf',
        };
        it('Should edit the user', () => {
          return pactum
            .spec()
            .patch('/users')
            .withBody(dto)
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(200)
            .expectBodyContains(dto.firstName)
            .expectBodyContains(dto.email);
        });
      });
    });

    describe('Bookmarks Route Testing', () => {
      describe('Get Empty Bookmark Testing', () => {
        it('Should gte bookmarks', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(200)
            .expectBody([]);
        });
      });

      describe('Crate Bookmark Route Testing', () => {
        const dto: CreateBookmarkDto = {
          title: 'LinkedIn Profile',
          link: 'https://www.linkedin.com/in/moustff/',
          description: 'This my linked in profile',
        };
        it('Should create a bookmark', () => {
          return pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .withBody(dto)
            .expectStatus(201)
            .stores('bookmarkId', 'id');
        });
      });

      describe('Get Bookmarks Route Testing', () => {
        it('Should return all the bookmarks', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(200)
            .expectJsonLength(1);
        });
      });

      describe('Get Bookmark By Id Route Testing', () => {
        it('Should return the bookmark that owns this id.', () => {
          return pactum
            .spec()
            .get('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(200)
            .expectBodyContains('$S{bookmarkId}');
        });
      });

      describe('Update Bookmark By Id Route Testing', () => {
        const dto: EditBookmarkDto = {
          description:
            'This is my professional linked in profile, I am Mustafa Salem',
        };
        it('Should edit the bookmark that owns this id.', () => {
          return pactum
            .spec()
            .patch('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains('$S{bookmarkId}')
            .expectBodyContains(dto.description);
        });
      });

      describe('Delete Bookmark By Id route Testing', () => {
        it('Should delete the bookmark that owns this id.', () => {
          return pactum
            .spec()
            .delete('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(204);
        });

        it('Should gte bookmarks', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
            .expectStatus(200)
            .expectBody([]);
        });
      });
    });

    it.todo('Should pass');
    it('Should return 2 when 1 + 1 is passed', () => {
      expect(1 + 1).toBe(2);
    });
  });
});
