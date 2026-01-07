import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TrustModule } from './trust.module';

describe('FraudDetectionController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TrustModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/admin/fraud/pending (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/api/admin/fraud/pending');
    expect(res.status).toBeDefined();
    // Add more assertions as needed
  });

  // Add more E2E tests for other endpoints
});
