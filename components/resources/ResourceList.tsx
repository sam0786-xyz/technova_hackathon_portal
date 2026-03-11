import { Resource } from "@/types/custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function ResourceList({ resources }: { resources: Resource[] }) {
    if (resources.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg">
                No resources found for the selected criteria.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {resources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg mb-1">{resource.title}</CardTitle>
                                <div className="flex gap-2 text-xs text-muted-foreground mb-1">
                                    {resource.semester && <Badge variant="outline">{resource.semester}</Badge>}
                                    {resource.type && <Badge variant="secondary">{resource.type}</Badge>}
                                    <span>• {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={resource.file_url} target="_blank">
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {resource.subject && (
                            <div className="text-sm font-medium mb-1 text-muted-foreground">Subject: {resource.subject}</div>
                        )}
                        {resource.description && (
                            <p className="text-sm text-foreground/80">{resource.description}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
