// custom.d.ts

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
