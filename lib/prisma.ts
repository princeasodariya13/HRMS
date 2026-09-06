import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          if (['Company', 'User', 'Employee'].includes(model)) {
            if (args.data && typeof args.data === 'object' && !('deletedAt' in args.data)) {
              (args.data as any).deletedAt = null;
            }
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (['Company', 'User', 'Employee'].includes(model)) {
            if (Array.isArray(args.data)) {
              args.data.forEach(item => {
                if (item && typeof item === 'object' && !('deletedAt' in item)) {
                  (item as any).deletedAt = null;
                }
              });
            }
          }
          return query(args);
        }
      }
    }
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
