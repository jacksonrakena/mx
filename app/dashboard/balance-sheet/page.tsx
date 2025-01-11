import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Charts } from "./components/Charts";

export default async function Overview() {
  const session = await auth();

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-2 mt-6">
            <div className="text-lg">Welcome back, Jackson</div>
            <div className="text-xl font-bold">+$6,723,195.58</div>
            <div className="text-sm">Last valuation 11 Jan, 2025</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="mt-6">{JSON.stringify(session)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Charts />
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </>
  );
}
