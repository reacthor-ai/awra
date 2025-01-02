import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";

export default async function RepresentativePage(params: NextPageProps<{ state: string }>) {
  const {params: {state}} = await params

  return (
    <MainNavigation title='Representatives'>
      <>content</>
    </MainNavigation>
  );
}