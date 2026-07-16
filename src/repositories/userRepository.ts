import { userInfoApi } from '@/api/userInfoApi';
import {
  adaptSystemUserToUserInfoDto,
  adaptUserInfoDtoToSystemUser,
} from '@/adapters/userAdapter';
import type { SystemUser } from '@/types/domain';
import { commonCodeRepository } from './commonCodeRepository';

export type UserRepository = {
  selectAll: () => Promise<SystemUser[]>;
  insert: (user: SystemUser) => Promise<void>;
  modify: (user: SystemUser) => Promise<void>;
  delete: (user: SystemUser) => Promise<void>;
};

const apiUserRepository: UserRepository = {
  async selectAll() {
    const [users, lookup] = await Promise.all([
      userInfoApi.selectAll(),
      commonCodeRepository.selectLookup().catch(() => undefined),
    ]);
    return users.map((user) => adaptUserInfoDtoToSystemUser(user, lookup));
  },
  async insert(user) {
    await userInfoApi.insert(adaptSystemUserToUserInfoDto(user));
  },
  async modify(user) {
    await userInfoApi.modify(adaptSystemUserToUserInfoDto(user));
  },
  async delete(user) {
    await userInfoApi.delete(user.username);
  },
};

export const userRepository = apiUserRepository;
