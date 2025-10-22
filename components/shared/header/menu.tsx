// components/shared/header/menu.tsx
import { Button } from '@/components/ui/button';
import UserButton from './user-button';
import Link from 'next/link';
const ModeToggle = () => <div>Mode Toggle</div>;
export default function HeaderMenu() {
    return (
        <nav className='md:flex hidden w-full max-w-xs gap-1'>
            <ModeToggle />
            <Button asChild variant='ghost'>
                <Link href='/cart'>Cart</Link>
            </Button>
            <UserButton /> {/* <-- Thêm vào đây */}
        </nav>
    );
}