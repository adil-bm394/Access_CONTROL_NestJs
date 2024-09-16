import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UpdateDto } from './dto/update.dto';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { errorMessages, successMessages } from '../utils/messages/messages';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let roleRepository: RoleRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
  };

  const mockRoleRepository = {
    getRoleById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user if found and currentUserId matches', async () => {
      const user = new User();
      user.id = 1;
      user.password = 'hashedpassword';

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.findOne(1, 1);

      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_FETCHED,
        user: { ...user, password: undefined },
      });
    });

    it('should return NOT_FOUND error if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findOne(1, 1);

      expect(result).toEqual({
        status: statusCodes.NOT_FOUND,
        success: false,
        message: errorMessages.USER_NOT_FOUND,
      });
    });

    it('should return UNAUTHORIZED error if currentUserId does not match', async () => {
      const user = new User();
      user.id = 1;

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.findOne(1, 2);

      expect(result).toEqual({
        status: statusCodes.UNAUTHORIZED,
        success: false,
        message: errorMessages.ACCESS_NOT_ALLOWED,
      });
    });

    it('should return INTERNAL_SERVER_ERROR if an exception occurs', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.findOne(1, 1);

      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });

 describe('update', () => {
   it('should update user if found and currentUserId matches', async () => {
     const user = new User();
     user.id = 1;

     mockUserRepository.findById.mockResolvedValue(user);
     mockUserRepository.updateUser.mockResolvedValue(undefined);
     mockUserRepository.findById.mockResolvedValue(user);

     const updatedData: UpdateDto = {
       username: 'Updated Name',
       address: 'updatedAddress',
     };
     const result = await service.update(1, updatedData, 1);

     expect(result).toEqual({
       status: statusCodes.OK,
       success: true,
       message: successMessages.USER_UPDATED,
       user: { ...user, password: undefined },
     });
   });

   it('should return NOT_FOUND error if user does not exist', async () => {
     mockUserRepository.findById.mockResolvedValue(null);

     // Provide a valid UpdateDto object here
     const updatedData: UpdateDto = {
       username: 'Any Name',
       address: 'Any Address',
     };
     const result = await service.update(1, updatedData, 1);

     expect(result).toEqual({
       status: statusCodes.NOT_FOUND,
       success: false,
       message: errorMessages.USER_NOT_FOUND,
     });
   });

   it('should return UNAUTHORIZED error if currentUserId does not match', async () => {
     const user = new User();
     user.id = 1;

     mockUserRepository.findById.mockResolvedValue(user);

     // Provide a valid UpdateDto object here
     const updatedData: UpdateDto = {
       username: 'Any Name',
       address: 'Any Address',
     };
     const result = await service.update(1, updatedData, 2);

     expect(result).toEqual({
       status: statusCodes.UNAUTHORIZED,
       success: false,
       message: errorMessages.UPDATE_NOT_ALLOWED,
     });
   });

   it('should return INTERNAL_SERVER_ERROR if an exception occurs', async () => {
     mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

     // Provide a valid UpdateDto object here
     const updatedData: UpdateDto = {
       username: 'Any Name',
       address: 'Any Address',
     };
     const result = await service.update(1, updatedData, 1);

     expect(result).toEqual({
       status: statusCodes.INTERNAL_SERVER_ERROR,
       success: false,
       message: errorMessages.INTERNAL_SERVER_ERROR,
       error: 'Database error',
     });
   });
 });

  describe('delete', () => {
    it('should delete user if found and currentUserId matches', async () => {
      const user = new User();
      user.id = 1;

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.softDeleteUser.mockResolvedValue(undefined);

      const result = await service.delete(1, 1);

      expect(result).toEqual({
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_DELETED,
      });
    });

    it('should return NOT_FOUND error if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.delete(1, 1);

      expect(result).toEqual({
        status: statusCodes.NOT_FOUND,
        success: false,
        message: errorMessages.USER_NOT_FOUND,
      });
    });

    it('should return UNAUTHORIZED error if currentUserId does not match', async () => {
      const user = new User();
      user.id = 1;

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.delete(1, 2);

      expect(result).toEqual({
        status: statusCodes.UNAUTHORIZED,
        success: false,
        message: errorMessages.DELETE_NOT_ALLOWED,
      });
    });

    it('should return INTERNAL_SERVER_ERROR if an exception occurs', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.delete(1, 1);

      expect(result).toEqual({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: 'Database error',
      });
    });
  });
});
