import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { TotoAvatar } from "@/components/TotoAvatar";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8">
        <TotoAvatar mood="thinking" size="xl" />
      </div>
      
      <h1 className="text-4xl font-display font-bold text-foreground mb-4">
        Oops! 
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We swam too deep and got lost. This page doesn't exist.
      </p>

      <Link href="/">
        <Button className="rounded-full px-8 bg-primary hover:bg-primary/90">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
