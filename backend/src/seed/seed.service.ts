import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

const ADMIN_EMAIL    = 'admin@smoe-ifdl.ma';
const ADMIN_PASSWORD = 'Admin@SMOE2024';

const DEMO_USERS = [
  { nom: 'Responsable', prenom: 'Qualité',   email: 'qualite@smoe-ifdl.ma',   role: 'responsable_qualite', password: 'Qualite@SMOE2024' },
  { nom: 'Coordonnateur', prenom: 'Master',  email: 'coord@smoe-ifdl.ma',      role: 'coordonnateur',       password: 'Coord@SMOE2024'   },
  { nom: 'Enseignant',  prenom: 'Demo',      email: 'enseignant@smoe-ifdl.ma', role: 'enseignant',          password: 'Enseignant@2024'  },
  { nom: 'Étudiant',   prenom: 'Demo',       email: 'etudiant@smoe-ifdl.ma',   role: 'etudiant',            password: 'Etudiant@2024'    },
  { nom: 'Auditeur',   prenom: 'Interne',    email: 'auditeur@smoe-ifdl.ma',   role: 'auditeur',            password: 'Auditeur@2024'    },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
    await this.seedDemoUsers();
  }

  private async seedAdmin(): Promise<void> {
    const exists = await this.userRepo.findOne({ where: { email: ADMIN_EMAIL } });
    if (exists) return;

    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await this.userRepo.save(
      this.userRepo.create({
        nom: 'Administrateur',
        prenom: 'SMOE',
        email: ADMIN_EMAIL,
        password_hash,
        role: 'admin',
        is_active: true,
      }),
    );
    this.logger.log(`Admin créé : ${ADMIN_EMAIL}`);
  }

  private async seedDemoUsers(): Promise<void> {
    for (const u of DEMO_USERS) {
      const exists = await this.userRepo.findOne({ where: { email: u.email } });
      if (exists) continue;
      const password_hash = await bcrypt.hash(u.password, 12);
      await this.userRepo.save(
        this.userRepo.create({
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          password_hash,
          role: u.role,
          is_active: true,
        }),
      );
      this.logger.log(`Utilisateur démo créé : ${u.email}`);
    }
  }
}
