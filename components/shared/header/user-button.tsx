'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutUser } from '@/lib/actions/user.actions';
import { useSession } from 'next-auth/react';

export default function UserButton() {
  const { data: session } = useSession();

  // Nếu chưa login, hiển thị nút Sign In
  if (!session) {
    return (
      <Link href='/sign-in'>
        <Button>Sign In</Button>
      </Link>
    );
  }

  // Lấy chữ cái đầu của tên user
  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? '';

  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              className='relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-300'
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {session.user?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem className='p-0 mb-1'>
            <form action={SignOutUser} className='w-full'>
              <Button
                className='w-full py-4 px-2 h-4 justify-start'
                variant='ghost'
              >
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
