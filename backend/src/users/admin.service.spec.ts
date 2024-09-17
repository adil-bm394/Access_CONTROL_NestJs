import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';
import { Role } from './entities/role.entity';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { errorMessages, successMessages } from '../utils/messages/messages';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: UserRepository;
  let roleRepository: RoleRepository;

  const mockUserRepository = {
    findAllUsers: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    getRoleById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<UserRepository>(UserRepository);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'adil@binmile.com',
          password: '123456',
          status: 'active',
          role: new Role(),
        },
        {
          id: 2,
          email: 'faheem@binmile.com',
          password: '123456',
          status: 'active',
          role: new Role(),
        },
      ];

      mockUserRepository.findAllUsers.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_FETCHED,
        users: mockUsers.map((user) => ({ ...user, password: undefined })),
      });
    });

    it('should handle errors and return an error response', async () => {
      mockUserRepository.findAllUsers.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.findAll();
      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'adil@binmile.com',
        password: '123456',
        status: 'active',
        role: new Role(),
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_FETCHED,
        user: { ...mockUser, password: undefined },
      });
    });

    it('should return not found if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findOne(1);
      expect(result).toEqual({
        status: statusCodes.NOT_FOUND,
        success: false,
        message: errorMessages.USER_NOT_FOUND,
      });
    });

    it('should handle errors and return an error response', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.findOne(1);
      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const mockUser = { id: 1, status: 'active' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      });

      const result = await service.deactivateUser(1);
      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_DEACTIVATED,
      });
    });

    it('should return not found if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.deactivateUser(1);
      expect(result).toEqual({
        status: statusCodes.NOT_FOUND,
        success: false,
        message: errorMessages.USER_NOT_FOUND,
      });
    });

    it('should handle errors and return an error response', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.deactivateUser(1);
      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      const mockUser = { id: 1, status: 'inactive' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        status: 'active',
      });

      const result = await service.activateUser(1);
      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_ACTIVATED,
      });
    });

    it('should return not found if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.activateUser(1);
      expect(result).toEqual({
        status: statusCodes.NOT_FOUND,
        success: false,
        message: errorMessages.USER_NOT_FOUND,
      });
    });

    it('should handle errors and return an error response', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.activateUser(1);
      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });
});
