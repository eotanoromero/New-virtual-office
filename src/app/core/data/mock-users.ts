import { Profile } from '../../shared/enum/profile.enum';

export const MOCK_USERS = [
  {
    code: '1001',
    email: 'admin1@example.com',
    name: 'Juan Pérez',
    role: Profile.ADMIN,
  },
  {
    code: '1002',
    email: 'admin2@example.com',
    name: 'Ana Martínez',
    role: Profile.ADMIN,
  },
];
