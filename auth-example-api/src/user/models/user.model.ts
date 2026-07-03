import { Column, DataType, Model, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, Partial<User>> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: true })
  declare walletAddress: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: true })
  declare googleId: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: true })
  declare email: string;

  @Column({ type: DataType.DATE })
  declare lastLoginAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;
}