import { appUrl } from "../../../lib/app-url"
import { Button } from '@workspace/ui/components/button'
import { Link } from "@tanstack/react-router"
import { Card } from '@workspace/ui/components/card'
import { LayoutIllustration } from "../../illustrations/layout-illustration"

export default function CallToAction() {
    return (
        <div className="py-12 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <Card className="relative overflow-hidden pl-8 pt-8 shadow-lg md:p-20">
                    <div className="max-w-xl max-md:pr-8">
                        <div className="relative">
                            <h2 className="text-balance text-3xl font-semibold md:text-4xl">Ready to build your next website?</h2>
                            <p className="text-muted-foreground mb-6 mt-4 text-balance">Join thousands of developers and agencies building websites faster with AI-powered automation.</p>

                            <Button asChild>
                                <a href={appUrl("/auth?mode=sign-up")}>Start Building</a>
                            </Button>
                        </div>
                    </div>
                    <div className="max-lg:mask-b-from-35% max-lg:pt-6 max-md:mt-4 lg:absolute lg:inset-0 lg:top-12 lg:ml-auto lg:w-2/5">
                        <LayoutIllustration />
                    </div>
                </Card>
            </div>
        </div>
    )
}