import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;
  
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { name: createUserDto.permission || 'reader' },
    });

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        permissionId: permission.id,
      },
      include: {
        permission: true,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        permission: true,
      },
    });

    return users.map(({ password: _, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        permission: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    const updateData: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.permission) {
      const permission = await this.prisma.permission.findUnique({
        where: { name: updateUserDto.permission },
      });

      if (!permission) {
        throw new NotFoundException('Permissão não encontrada');
      }

      updateData.permissionId = permission.id;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        permission: true,
      },
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }
}
