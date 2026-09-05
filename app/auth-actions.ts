'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const companyName = formData.get('company') as string

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      redirect(`/signup?error=${encodeURIComponent('User with this email already exists')}`)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName || "My Company",
        }
      })
      
      await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          companyId: company.id,
          role: 'SUPER_ADMIN'
        }
      })
    })

    revalidatePath('/', 'layout')
    redirect('/login?type=admin&message=' + encodeURIComponent('Account created successfully! Please login with your credentials.'))
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("Prisma error during signup", e)
    redirect(`/signup?error=${encodeURIComponent('An error occurred during signup.')}`)
  }
}

export async function employeeSignup(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      redirect(`/signup/employee?error=${encodeURIComponent('User with this email already exists')}`)
    }

    const defaultCompany = await prisma.company.findFirst()
    
    if (defaultCompany) {
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email,
            password: hashedPassword,
            companyId: defaultCompany.id,
            role: 'EMPLOYEE'
          }
        })
        
        await tx.employee.create({
          data: {
            companyId: defaultCompany.id,
            userId: user.id,
            firstName: firstName || "New",
            lastName: lastName || "Employee",
            workEmail: email,
            employeeCode: `EMP-${Math.floor(Math.random() * 9000) + 1000}`,
            joiningDate: new Date(),
            status: 'ACTIVE'
          }
        })
      })
    }

    revalidatePath('/', 'layout')
    redirect('/login?type=employee&message=' + encodeURIComponent('Account created successfully! Please login with your new credentials.'))
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("Prisma error during employee signup", e)
    redirect(`/signup/employee?error=${encodeURIComponent('An error occurred during employee signup.')}`)
  }
}
