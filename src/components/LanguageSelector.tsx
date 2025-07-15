
"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function LanguageSelector() {
  const { setLanguage } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            Choose Your Language / अपनी भाषा चुनें
          </CardTitle>
          <CardDescription>
            Select your preferred language to continue. / जारी रखने के लिए अपनी पसंदीदा भाषा चुनें।
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => setLanguage('en')} size="lg">
            English
          </Button>
          <Button onClick={() => setLanguage('hi')} size="lg">
            हिन्दी (Hindi)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
