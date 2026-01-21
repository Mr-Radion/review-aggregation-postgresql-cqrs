import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';

@Entity({ name: 'reviews' })
@Check(`"rating" >= 1 AND "rating" <= 5`)
@Check(`"recipientId" <> "authorId"`)
@Index(['recipientId'])
@Index(['authorId'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  recipientId: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
