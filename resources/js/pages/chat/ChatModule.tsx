// ChatModule.tsx
// WhatsApp-style chat UI — shadcn/ui + Tailwind CSS + TypeScript
// Place at: resources/js/Pages/Chat/ChatModule.tsx  (Laravel + Inertia)
//
// shadcn/ui components used (all default):
//   Avatar · AvatarFallback · AvatarImage
//   Badge
//   Button
//   DropdownMenu · DropdownMenuContent · DropdownMenuItem · DropdownMenuTrigger
//   Input
//   ScrollArea
//   Separator
//   Tooltip · TooltipContent · TooltipProvider · TooltipTrigger

import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Smile,
    Paperclip,
    Send,
    Mic,
    Check,
    CheckCheck,
    MessageSquare,
    Users,
    Star,
    Archive,
    Settings,
    ChevronLeft,
    ImageIcon,
    FileText,
    Camera,
    Contact,
} from 'lucide-react';

import { useState, useRef, useEffect } from 'react';
import type { FC, KeyboardEvent } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/AppLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = 'sent' | 'delivered' | 'read';

interface Message {
    id: number;
    from: 'me' | 'them';
    sender?: string;
    text: string;
    time: string;
    status: MessageStatus;
}

interface Contact {
    id: number;
    name: string;
    avatar: string;
    initials: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    isGroup?: boolean;
    messages: Message[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
    {
        id: 1,
        name: 'Sarah Johnson',
        avatar: '',
        initials: 'SJ',
        lastMessage: 'Are you coming to the meeting?',
        time: '10:42 AM',
        unread: 3,
        online: true,
        messages: [
            {
                id: 1,
                from: 'them',
                text: 'Hey! How are you?',
                time: '10:30 AM',
                status: 'read',
            },
            {
                id: 2,
                from: 'me',
                text: "I'm great, thanks! What's up?",
                time: '10:32 AM',
                status: 'read',
            },
            {
                id: 3,
                from: 'them',
                text: 'Are you coming to the meeting?',
                time: '10:42 AM',
                status: 'delivered',
            },
        ],
    },
    {
        id: 2,
        name: 'Design Team 🎨',
        avatar: '',
        initials: 'DT',
        lastMessage: 'Miguel: Pushed the new mockups',
        time: '9:15 AM',
        unread: 12,
        online: false,
        isGroup: true,
        messages: [
            {
                id: 1,
                from: 'them',
                sender: 'Miguel',
                text: 'Pushed the new mockups to Figma',
                time: '9:10 AM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                sender: 'Priya',
                text: 'Looks amazing 🔥',
                time: '9:12 AM',
                status: 'read',
            },
            {
                id: 3,
                from: 'me',
                text: 'Will review after standup',
                time: '9:15 AM',
                status: 'sent',
            },
        ],
    },
    {
        id: 3,
        name: 'Marcus Chen',
        avatar: '',
        initials: 'MC',
        lastMessage: 'Thanks, talk later!',
        time: 'Yesterday',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'me',
                text: 'Did you finish the PR?',
                time: 'Yesterday 4:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: 'Yes, just merged it',
                time: 'Yesterday 4:05 PM',
                status: 'read',
            },
            {
                id: 3,
                from: 'them',
                text: 'Thanks, talk later!',
                time: 'Yesterday 4:06 PM',
                status: 'read',
            },
        ],
    },
    {
        id: 4,
        name: 'Priya Kapoor',
        avatar: '',
        initials: 'PK',
        lastMessage: '📷 Photo',
        time: 'Yesterday',
        unread: 1,
        online: true,
        messages: [
            {
                id: 1,
                from: 'them',
                text: 'Check this out!',
                time: 'Yesterday 6:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: '📷 Photo',
                time: 'Yesterday 6:01 PM',
                status: 'delivered',
            },
        ],
    },
    {
        id: 5,
        name: 'Alex Rivera',
        avatar: '',
        initials: 'AR',
        lastMessage: "Let's catch up soon",
        time: 'Mon',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'them',
                text: 'Long time no see!',
                time: 'Mon 2:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'me',
                text: 'I know right!',
                time: 'Mon 2:10 PM',
                status: 'read',
            },
            {
                id: 3,
                from: 'them',
                text: "Let's catch up soon",
                time: 'Mon 2:12 PM',
                status: 'read',
            },
        ],
    },
    {
        id: 6,
        name: 'Yuki Tanaka',
        avatar: '',
        initials: 'YT',
        lastMessage: '👍',
        time: 'Sun',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'me',
                text: 'Sent you the files',
                time: 'Sun 11:00 AM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: '👍',
                time: 'Sun 11:05 AM',
                status: 'read',
            },
        ],
    },
    {
        id: 7,
        name: 'Marcus Chen',
        avatar: '',
        initials: 'MC',
        lastMessage: 'Thanks, talk later!',
        time: 'Yesterday',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'me',
                text: 'Did you finish the PR?',
                time: 'Yesterday 4:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: 'Yes, just merged it',
                time: 'Yesterday 4:05 PM',
                status: 'read',
            },
            {
                id: 3,
                from: 'them',
                text: 'Thanks, talk later!',
                time: 'Yesterday 4:06 PM',
                status: 'read',
            },
        ],
    },
    {
        id: 8,
        name: 'Priya Kapoor',
        avatar: '',
        initials: 'PK',
        lastMessage: '📷 Photo',
        time: 'Yesterday',
        unread: 1,
        online: true,
        messages: [
            {
                id: 1,
                from: 'them',
                text: 'Check this out!',
                time: 'Yesterday 6:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: '📷 Photo',
                time: 'Yesterday 6:01 PM',
                status: 'delivered',
            },
        ],
    },
    {
        id: 9,
        name: 'Alex Rivera',
        avatar: '',
        initials: 'AR',
        lastMessage: "Let's catch up soon",
        time: 'Mon',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'them',
                text: 'Long time no see!',
                time: 'Mon 2:00 PM',
                status: 'read',
            },
            {
                id: 2,
                from: 'me',
                text: 'I know right!',
                time: 'Mon 2:10 PM',
                status: 'read',
            },
            {
                id: 3,
                from: 'them',
                text: "Let's catch up soon",
                time: 'Mon 2:12 PM',
                status: 'read',
            },
        ],
    },
    {
        id: 10,
        name: 'Yuki Tanaka',
        avatar: '',
        initials: 'YT',
        lastMessage: '👍',
        time: 'Sun',
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                from: 'me',
                text: 'Sent you the files',
                time: 'Sun 11:00 AM',
                status: 'read',
            },
            {
                id: 2,
                from: 'them',
                text: '👍',
                time: 'Sun 11:05 AM',
                status: 'read',
            },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS: string[] = [
    'bg-rose-400',
    'bg-violet-400',
    'bg-amber-400',
    'bg-teal-400',
    'bg-sky-400',
    'bg-pink-400',
];

function colorFor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ─── StatusIcon ───────────────────────────────────────────────────────────────

interface StatusIconProps {
    status: MessageStatus;
}

const StatusIcon: FC<StatusIconProps> = ({ status }) => {
    if (status === 'sent')
        return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
    if (status === 'delivered')
        return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
    if (status === 'read')
        return <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />;
    return null;
};

// ─── ContactRow ───────────────────────────────────────────────────────────────

interface ContactRowProps {
    contact: Contact;
    active: boolean;
    onClick: () => void;
}

const ContactRow: FC<ContactRowProps> = ({ contact, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent ${
            active ? 'bg-accent' : ''
        }`}
    >
        <div className="relative shrink-0">
            <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback
                    className={`${colorFor(contact.id)} text-sm font-semibold text-white`}
                >
                    {contact.initials}
                </AvatarFallback>
            </Avatar>
            {contact.online && (
                <span className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full bg-[#25d366] ring-2 ring-background" />
            )}
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                    {contact.name}
                </span>
                <span
                    className={`shrink-0 text-xs ${
                        contact.unread > 0
                            ? 'font-medium text-[#25d366]'
                            : 'text-muted-foreground'
                    }`}
                >
                    {contact.time}
                </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-muted-foreground">
                    {contact.lastMessage}
                </p>
                {contact.unread > 0 && (
                    <Badge className="h-5 min-w-5 shrink-0 rounded-full bg-[#25d366] px-1.5 text-[10px] font-bold text-white hover:bg-[#25d366]">
                        {contact.unread}
                    </Badge>
                )}
            </div>
        </div>
    </button>
);

// ─── MessageBubble ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
    msg: Message;
    isGroup?: boolean;
}

const MessageBubble: FC<MessageBubbleProps> = ({ msg, isGroup }) => {
    const isMe = msg.from === 'me';
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
            <div
                className={`relative max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm sm:max-w-[60%] ${
                    isMe
                        ? 'rounded-tr-sm bg-[#d9fdd3] text-foreground'
                        : 'rounded-tl-sm border border-border/50 bg-card text-foreground'
                }`}
            >
                {isGroup && !isMe && msg.sender && (
                    <p className="mb-0.5 text-xs font-semibold text-[#25d366]">
                        {msg.sender}
                    </p>
                )}
                <p className="wrap-break-words pr-12">{msg.text}</p>
                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                        {msg.time}
                    </span>
                    {isMe && <StatusIcon status={msg.status} />}
                </div>
            </div>
        </div>
    );
};

// ─── SidebarContent ───────────────────────────────────────────────────────────

interface SidebarContentProps {
    contacts: Contact[];
    activeId: number | null;
    onSelect: (id: number) => void;
}

const SidebarContent: FC<SidebarContentProps> = ({
    contacts,
    activeId,
    onSelect,
}) => {
    const [search, setSearch] = useState<string>('');

    const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#25d366] text-sm font-bold text-white">
                            Me
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-semibold text-foreground sm:block">
                        My Chats
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>New group</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>New chat</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem>
                                <Star className="mr-2 h-4 w-4" />
                                Starred messages
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Archived chats
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Search */}
            <div className="bg-background px-3 py-2">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search or start new chat"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 rounded-lg border-0 bg-muted/60 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-[#25d366]"
                    />
                </div>
            </div>

            <Separator />

            {/* Contact list */}
            <ScrollArea className="flex-1 overflow-x-hidden overflow-y-auto">
                {filtered.map((c) => (
                    <ContactRow
                        key={c.id}
                        contact={c}
                        active={c.id === activeId}
                        onClick={() => onSelect(c.id)}
                    />
                ))}
            </ScrollArea>
        </div>
    );
};

// ─── ChatPanel ────────────────────────────────────────────────────────────────

interface ChatPanelProps {
    contact: Contact;
    onBack: () => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ contact, onBack }) => {
    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>(contact.messages);
    const bottomRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     setMessages(contact.messages);
    // }, [contact.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (): void => {
        const text = input.trim();
        if (!text) return;

        const now = new Date();
        const time = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        setMessages((prev) => [
            ...prev,
            { id: Date.now(), from: 'me', text, time, status: 'sent' },
        ]);
        setInput('');
    };

    const handleKey = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Chat header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-muted/40 px-3 py-3 sm:px-4">
                {/* Back button — mobile only */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground sm:hidden"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback
                            className={`${colorFor(contact.id)} text-sm font-semibold text-white`}
                        >
                            {contact.initials}
                        </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[#25d366] ring-2 ring-background" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {contact.online
                            ? 'online'
                            : contact.isGroup
                              ? `${contact.messages.length} members`
                              : 'last seen recently'}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden h-9 w-9 text-muted-foreground hover:text-foreground sm:flex"
                                >
                                    <Video className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Video call</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden h-9 w-9 text-muted-foreground hover:text-foreground sm:flex"
                                >
                                    <Phone className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voice call</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden h-9 w-9 text-muted-foreground hover:text-foreground sm:flex"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Search in chat</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem>Contact info</DropdownMenuItem>
                            <DropdownMenuItem>Select messages</DropdownMenuItem>
                            <DropdownMenuItem>Clear chat</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Delete chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages area */}
            <div
                className="flex-1 overflow-y-auto px-3 py-4 sm:px-6"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                }}
            >
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isGroup={contact.isGroup}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border/50 bg-muted/40 px-3 py-3 sm:px-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Emoji</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="start"
                        className="mb-2 w-44"
                    >
                        <DropdownMenuItem>
                            <ImageIcon className="mr-2 h-4 w-4 text-violet-500" />
                            Photos &amp; Videos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Camera className="mr-2 h-4 w-4 text-pink-500" />
                            Camera
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            Document
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Contact className="mr-2 h-4 w-4 text-teal-500" />
                            Contact
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type a message"
                    className="h-10 flex-1 rounded-full border-0 bg-background px-4 text-sm focus-visible:ring-1 focus-visible:ring-[#25d366]"
                />

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-full bg-[#25d366] text-white shadow-sm hover:bg-[#1ebe5d]"
                                onClick={sendMessage}
                            >
                                {input.trim() ? (
                                    <Send className="h-4 w-4" />
                                ) : (
                                    <Mic className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {input.trim() ? 'Send message' : 'Voice message'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState: FC = () => (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/20 px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#25d366]/10">
            <MessageSquare className="h-12 w-12 text-[#25d366]" />
        </div>
        <div>
            <h3 className="text-xl font-semibold text-foreground">
                WhatsApp Web
            </h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Send and receive messages without keeping your phone online.
            </p>
        </div>
        <Badge
            variant="outline"
            className="border-dashed text-xs text-muted-foreground"
        >
            🔒 End-to-end encrypted
        </Badge>
    </div>
);

// ─── ChatModule (root) ────────────────────────────────────────────────────────

interface ChatModuleComponent extends FC {
    layout: (page: React.ReactNode) => React.ReactNode;
}

const ChatModule: ChatModuleComponent = () => {
    const [activeId, setActiveId] = useState<number | null>(null);

    const activeContact = CONTACTS.find((c) => c.id === activeId) ?? null;

    // Mobile: show only sidebar OR chat panel at a time
    const showSidebar = activeId === null;
    const showChat = activeId !== null;

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* ── SIDEBAR ── */}
            <div
                className={[
                    'w-full shrink-0 md:w-85 lg:w-95',
                    'flex-col border-r border-border/60',
                    showSidebar ? 'flex' : 'hidden',
                    'md:flex',
                ].join(' ')}
            >
                <SidebarContent
                    contacts={CONTACTS}
                    activeId={activeId}
                    onSelect={(id: number) => setActiveId(id)}
                />
            </div>

            {/* ── CHAT PANEL ── */}
            <div
                className={[
                    'min-w-0 flex-1 flex-col',
                    showChat ? 'flex' : 'hidden',
                    'md:flex',
                ].join(' ')}
            >
                {activeContact ? (
                    <ChatPanel
                        contact={activeContact}
                        onBack={() => setActiveId(null)}
                    />
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

ChatModule.layout = (page: React.ReactNode) => (
    <AppLayout children={page} fullLayout={true} />
);

export default ChatModule;
