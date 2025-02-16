import Account from "@/components/Account";
import Auth from "@/components/Auth";
import { useSession } from "@/context/SessionContext";

  

export default function AccountPage()
{

   const {session} = useSession()


    return(
       session?.user ? <Account session={session!}/> : <Auth/>
        
    )
}