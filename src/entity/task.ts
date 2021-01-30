import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Length } from "class-validator";
import { User } from "./user";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 80
    })
    @Length(10, 80)
    name: string;

    @Column()
    description: string;

    @ManyToOne(() => User)
    user: User;

}

export const taskSchema = {
    id: { type: "number", required: true, example: 1 },
    name: { type: "string", required: true, example: "Very hard task" },
    description: { type: "string", required: true, example: "Improve perfomance" },
    user: {id: 1}
};