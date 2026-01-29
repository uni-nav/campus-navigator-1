/**
 * User Feedback Widget
 * Allows users to report issues and provide feedback
 */

import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { captureMessage, addBreadcrumb, Sentry } from '@/lib/sentry';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

interface FeedbackData {
    name: string;
    email: string;
    message: string;
    type: 'bug' | 'feedback' | 'question';
}

interface FeedbackWidgetProps {
    position?: 'bottom-right' | 'bottom-left';
}

export function FeedbackWidget({ position = 'bottom-right' }: FeedbackWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<FeedbackData>({
        name: '',
        email: '',
        message: '',
        type: 'feedback'
    });

    const positionClasses = position === 'bottom-right'
        ? 'right-4'
        : 'left-4';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Add breadcrumb
            addBreadcrumb('feedback', 'User submitted feedback', {
                type: formData.type,
                hasEmail: !!formData.email,
            });

            // Capture as Sentry message
            captureMessage(
                `User Feedback [${formData.type}]: ${formData.message.substring(0, 100)}`,
                'info'
            );

            // Set user context if email provided
            if (formData.email) {
                Sentry.setUser({ email: formData.email });
            }

            // Log locally
            logger.info('User feedback submitted', {
                type: formData.type,
                name: formData.name,
            });

            // TODO: Send to backend API
            // await sendFeedbackToBackend(formData);

            setIsSubmitted(true);

            // Reset after 3 seconds
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
                setFormData({ name: '', email: '', message: '', type: 'feedback' });
            }, 3000);

        } catch (error) {
            logger.error('Failed to submit feedback', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't show in production if Sentry is not configured
    if (config.isProduction && !import.meta.env.VITE_SENTRY_DSN) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 ${positionClasses} z-50`}>
            {/* Floating button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
                    aria-label="Fikr bildirish"
                >
                    <MessageSquare className="w-6 h-6" />
                </Button>
            )}

            {/* Feedback form */}
            {isOpen && (
                <Card className="w-80 p-4 shadow-xl animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">
                            {isSubmitted ? 'Rahmat!' : 'Fikringizni bildiring'}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {isSubmitted ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                Fikringiz uchun rahmat! Tez orada ko'rib chiqamiz.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type selector */}
                            <div className="flex gap-2">
                                {(['feedback', 'bug', 'question'] as const).map((type) => (
                                    <Button
                                        key={type}
                                        type="button"
                                        size="sm"
                                        variant={formData.type === type ? 'default' : 'outline'}
                                        onClick={() => setFormData(d => ({ ...d, type }))}
                                        className="flex-1 text-xs"
                                    >
                                        {type === 'feedback' ? 'Fikr' : type === 'bug' ? 'Xato' : 'Savol'}
                                    </Button>
                                ))}
                            </div>

                            {/* Name */}
                            <div className="space-y-1">
                                <Label htmlFor="feedback-name" className="text-xs">
                                    Ismingiz (ixtiyoriy)
                                </Label>
                                <Input
                                    id="feedback-name"
                                    placeholder="Ismingiz"
                                    value={formData.name}
                                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <Label htmlFor="feedback-email" className="text-xs">
                                    Email (ixtiyoriy)
                                </Label>
                                <Input
                                    id="feedback-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-1">
                                <Label htmlFor="feedback-message" className="text-xs">
                                    Xabar *
                                </Label>
                                <Textarea
                                    id="feedback-message"
                                    placeholder="Fikringizni yozing..."
                                    value={formData.message}
                                    onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                                    required
                                    className="min-h-[80px] text-sm resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || !formData.message.trim()}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Yuborilmoqda...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        Yuborish
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </Card>
            )}
        </div>
    );
}
