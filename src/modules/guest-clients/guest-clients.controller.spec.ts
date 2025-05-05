import { Test, TestingModule } from '@nestjs/testing';
import { GuestClientsController } from './guest-clients.controller';
import { GuestClientsService } from './guest-clients.service';

describe('GuestClientsController', () => {
  let controller: GuestClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestClientsController],
      providers: [GuestClientsService],
    }).compile();

    controller = module.get<GuestClientsController>(GuestClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
