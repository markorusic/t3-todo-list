import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return todos;
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
          isDone: false,
        },
      });
      return todo;
    }),
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentTodo = await ctx.prisma.todo.findUniqueOrThrow({
        where: { id: input.id },
      });
      const updatedTodo = await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          isDone: !currentTodo.isDone,
        },
      });
      return updatedTodo;
    }),
});
