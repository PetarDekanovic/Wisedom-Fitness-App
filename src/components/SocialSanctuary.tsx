import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Send, 
  Trash2, 
  Edit, 
  X, 
  Plus, 
  Sparkles, 
  Link as LinkIcon, 
  Youtube, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Search,
  BookOpen,
  UserCheck,
  UserPlus,
  UserX,
  Clock,
  ChevronLeft,
  Check,
  Paperclip,
  Smile
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PublicProfile, CommunityPost, Conversation, DMMessage, UserProfile } from '../types';

interface SocialSanctuaryProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  currentUser: any; // FirebaseUser
  userProfile: UserProfile;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error in Social Sanctuary:', JSON.stringify(errInfo));
}

const DUMMY_SCHOLARS: PublicProfile[] = [
  {
    uid: 'dummy_marcus_aurelius',
    name: 'Marcus Aurelius',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    biography: 'Emperor of Rome. Author of Meditations. Focuses on stoic temperance, deep morning journaling, and body callisthenics.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: []
  },
  {
    uid: 'dummy_seneca_younger',
    name: 'Lucius Seneca',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    biography: 'Imperial Advisor and playwright. Writing dialogues on tranquility and mental equilibrium under load.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: []
  },
  {
    uid: 'dummy_epictetus',
    name: 'Epictetus',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    biography: 'Born a slave, died a master. Teaching that we suffer not from events, but from our judgment of them.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: []
  },
  {
    uid: 'dummy_hypatia_alex',
    name: 'Hypatia',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    biography: 'Neoplatonist philosopher, leading astronomer and mathematician. Seeking physical hygiene and structural clarity.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: []
  }
];

export function SocialSanctuary({ isDarkMode, isGirlyMode, currentUser, userProfile }: SocialSanctuaryProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'peers' | 'moderation'>('feed');
  
  // Public profiles
  const [thisPublicProfile, setThisPublicProfile] = useState<PublicProfile | null>(null);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [setupBiography, setSetupBiography] = useState('');
  const [setupName, setSetupName] = useState(userProfile?.name || '');

  // Instant Engage Direct Message dialogue box
  const [engagePeer, setEngagePeer] = useState<PublicProfile | null>(null);
  const [engageMessage, setEngageMessage] = useState('');
  const [isSendingEngage, setIsSendingEngage] = useState(false);
  const [engageSuccess, setEngageSuccess] = useState(false);
  const [engageError, setEngageError] = useState<string | null>(null);

  // Sync setup name when profile loads
  useEffect(() => {
    if (userProfile?.name && !setupName) {
      setSetupName(userProfile.name);
    }
  }, [userProfile]);

  // Feed states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMediaType, setNewPostMediaType] = useState<'none' | 'image' | 'youtube' | 'tiktok'>('none');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Direct messages states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<DMMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [dummyTypingState, setDummyTypingState] = useState<string | null>(null);

  // Peers directory
  const [peers, setPeers] = useState<PublicProfile[]>(() => DUMMY_SCHOLARS.filter(d => d.uid !== currentUser?.uid));
  const [peerSearchQuery, setPeerSearchQuery] = useState('');
  const [selectedPeerWall, setSelectedPeerWall] = useState<PublicProfile | null>(null);
  const [peerWallPosts, setPeerWallPosts] = useState<CommunityPost[]>([]);

  // Admin moderation queue
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);

  // Check if current logged in is admin
  const isAdmin = currentUser?.email === 'petar.dekanovic@gmail.com' || userProfile?.role === 'admin';

  // Dummy provisioning states for message system validation
  const [isProvisioningDummy, setIsProvisioningDummy] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // File attachments and upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEngageModal: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit 50MB
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    
    if (file.size > MAX_SIZE_BYTES) {
      const errMsg = `File exceeds the safe ${MAX_SIZE_MB}MB sanctuary limit.`;
      if (isEngageModal) setEngageError(errMsg);
      else alert(errMsg);
      return;
    }

    setIsUploadingFile(true);
    if (isEngageModal) setEngageError(null);

    try {
      const reader = new FileReader();
      const fileLoadedPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      
      reader.readAsDataURL(file);
      const base64Data = await fileLoadedPromise;

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          base64Data
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server rejected attachment upload.');
      }

      const uploadResult = await response.json();
      
      const attachmentLabel = `[Attachment: ${file.name}](${uploadResult.url})`;
      if (isEngageModal) {
        setEngageMessage(prev => prev ? `${prev}\n${attachmentLabel}` : attachmentLabel);
      } else {
        setNewMessageText(prev => prev ? `${prev} ${attachmentLabel}` : attachmentLabel);
      }
    } catch (uploadErr: any) {
      console.error('File upload error:', uploadErr);
      const errMsg = uploadErr?.message || 'Sanctuary channels rejected upload. Try a smaller file.';
      if (isEngageModal) setEngageError(errMsg);
      else alert(errMsg);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const renderMessageTextWithAttachments = (text: string, isMine: boolean) => {
    if (!text) return null;

    const regex = /\[Attachment:\s*(.*?)\]\((.*?)\)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;
    const mediaMatches: { filename: string; url: string }[] = [];

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      
      const filename = match[1];
      const url = match[2];
      mediaMatches.push({ filename, url });

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    const remainsText = parts.length > 0 ? parts.join("") : text;

    return (
      <div className="space-y-2">
        {remainsText.trim() && (
          <p className="whitespace-pre-wrap font-handwritten text-lg leading-relaxed pt-0.5 select-text">
            {remainsText}
          </p>
        )}
        {mediaMatches.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-500/10 mt-2">
            {mediaMatches.map((m, i) => {
              const isImage = /\.(jpe?g|png|gif|webp|svg)/i.test(m.url);
              const isVideo = /\.(mp4|webm|mov|ogg)/i.test(m.url);
              const isPdf = /\.pdf/i.test(m.url);

              return (
                <div key={i} className="rounded-xl overflow-hidden bg-black/10 border border-zinc-550/15 p-2 text-left">
                  {isImage && (
                    <div className="space-y-1.5">
                      <img 
                        src={m.url} 
                        alt="attachment" 
                        className="max-h-56 w-full object-cover rounded-lg border border-white/5" 
                        referrerPolicy="no-referrer"
                      />
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] underline font-mono tracking-tight block hover:text-emerald-400 opacity-85"
                      >
                        {m.filename}
                      </a>
                    </div>
                  )}
                  {isVideo && (
                    <div className="space-y-1.5">
                      <video 
                        src={m.url} 
                        controls 
                        className="w-full max-h-56 rounded-lg object-contain bg-black" 
                      />
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] underline font-mono tracking-tight block hover:text-emerald-400 opacity-85"
                      >
                        {m.filename}
                      </a>
                    </div>
                  )}
                  {isPdf && (
                    <div className="flex items-center justify-between gap-2.5 bg-black/20 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-bold truncate max-w-[130px] leading-tight text-zinc-100">{m.filename}</p>
                          <p className="text-[8px] text-zinc-500 font-mono">PDF Document</p>
                        </div>
                      </div>
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-[8px] uppercase tracking-wider font-bold shrink-0 border border-zinc-700"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {!isImage && !isVideo && !isPdf && (
                    <div className="flex items-center justify-between gap-2 bg-black/20 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-bold truncate max-w-[130px] leading-tight text-zinc-100">{m.filename}</p>
                          <p className="text-[8px] text-zinc-500 font-mono">Payload File</p>
                        </div>
                      </div>
                      <a 
                        href={m.url} 
                        download 
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[8px] uppercase tracking-wider font-bold shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Friend requests database sync state
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  // 1. Initial lookup / registration of Public Profile to enable social activity
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, 'public_profiles', currentUser.uid);
    const unsub = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        setThisPublicProfile(snap.data() as PublicProfile);
      } else {
        // Silently provision public profile with defaults to completely prevent blocking the user
        try {
          const profileData: PublicProfile = {
            uid: currentUser.uid,
            name: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
            avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            biography: 'Seeking intellectual and physical discipline.',
            updatedAt: new Date().toISOString()
          };
          await setDoc(profileRef, profileData);
        } catch (e) {
          console.error('Auto-provision profile failed:', e);
          setIsSettingUpProfile(true);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `public_profiles/${currentUser.uid}`);
    });

    return () => unsub();
  }, [currentUser, userProfile]);

  // Presence keeper: Updates isOnline to true and regularly updates lastActive timestamp
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, 'public_profiles', currentUser.uid);

    const setPresence = async (status: boolean) => {
      try {
        const snap = await getDoc(profileRef);
        // Only update if public profile already registered
        if (snap.exists()) {
          await updateDoc(profileRef, {
            isOnline: status,
            lastActive: new Date().toISOString()
          });
        }
      } catch (err) {
        // Safe fail-silent if rules or network transient
        console.warn('Presence update skipped during setup:', err);
      }
    };

    // Begin session-online status
    setPresence(true);

    // Maintain session check interval
    const presenceInterval = setInterval(() => {
      setPresence(true);
    }, 40000);

    const handleBeforeUnload = () => {
      setPresence(false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setPresence(false);
    };
  }, [currentUser]);

  // Listen to received friend requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: any[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFriendRequests(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'friend_requests');
    });

    return () => unsub();
  }, [currentUser]);

  // Listen to sent friend requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('senderId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: any[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSentRequests(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'friend_requests_sent');
    });

    return () => unsub();
  }, [currentUser]);

  // Handle Save Biography
  const handleSavePublicProfile = async () => {
    if (!currentUser) return;
    try {
      const profileData: PublicProfile = {
        uid: currentUser.uid,
        name: setupName || userProfile?.name || 'Anonymous Seeker',
        avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        biography: setupBiography,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'public_profiles', currentUser.uid), profileData);
      setIsSettingUpProfile(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.uid}`);
    }
  };

  // 2. Fetch standard feed (only status === 'approved' posts, sorted by createdAt desc)
  useEffect(() => {
    if (!currentUser) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef, 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: CommunityPost[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      setPosts(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'social_posts');
    });

    return () => unsub();
  }, [currentUser]);

  // 3. Fetch Admin Queue if current is admin or Petar
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: CommunityPost[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      setPendingPosts(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'social_posts/pending');
    });

    return () => unsub();
  }, [currentUser, isAdmin]);

  // 4. Fetch Public peers directory
  useEffect(() => {
    if (!currentUser) {
      setPeers(DUMMY_SCHOLARS);
      return;
    }

    const profilesRef = collection(db, 'public_profiles');
    const unsub = onSnapshot(profilesRef, (snap) => {
      const fetched: PublicProfile[] = [];
      snap.forEach((docSnap) => {
        const u = docSnap.data() as PublicProfile;
        if (u.uid !== currentUser.uid) {
          fetched.push(u);
        }
      });
      
      // Ensure dummy scholars are always present if they don't already exist in the database stream
      DUMMY_SCHOLARS.forEach(dummy => {
        if (!fetched.some(p => p.uid === dummy.uid) && dummy.uid !== currentUser.uid) {
          fetched.push(dummy);
        }
      });

      setPeers(fetched);
    }, (err) => {
      console.warn("Firestore public_profiles list error, falling back to dummy accounts:", err);
      // Keep dummy scholars on list error so they are always interactive!
      setPeers(DUMMY_SCHOLARS.filter(d => d.uid !== currentUser.uid));
    });

    return () => unsub();
  }, [currentUser]);

  // 5. Fetch Ongoing Conversations list
  useEffect(() => {
    if (!currentUser) return;

    const convoRef = collection(db, 'conversations');
    const q = query(
      convoRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: Conversation[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
      });
      // Sort conversations based on lastMessageAt locally
      fetched.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const borderB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return borderB - dateA;
      });
      setConversations(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
    });

    return () => unsub();
  }, [currentUser]);

  // 6. Fetch Chat Messages inside an active DM channel
  useEffect(() => {
    if (!currentUser || !activeChat) return;

    const messagesRef = collection(db, 'conversations', activeChat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const fetched: DMMessage[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as DMMessage);
      });
      setChatMessages(fetched);
      
      // Auto-scroll to bottom of conversation
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `conversations/${activeChat.id}/messages`);
    });

    return () => unsub();
  }, [currentUser, activeChat]);

  // 6b. Auto-responder when sending message to any dummy scholar
  useEffect(() => {
    if (!currentUser || !activeChat || chatMessages.length === 0) return;
    
    // Find if active participant is a dummy scholar
    const dummyId = activeChat.participants.find(p => p.startsWith('dummy_'));
    if (!dummyId) return;

    const lastMsg = chatMessages[chatMessages.length - 1];
    
    // Check if the last message is from the user
    if (lastMsg.senderId === currentUser.uid) {
      // Trigger reply simulation
      const replyTimer = setTimeout(async () => {
        // Prevent typing twice and check states
        if (dummyTypingState) return;
        
        // Find scholar name
        const otherIndex = activeChat.participants[0] === currentUser.uid ? 1 : 0;
        const scholarName = activeChat.participantNames[otherIndex] || 'Stoic Mentor';
        
        setDummyTypingState(scholarName);

        // Instantly force scroll to typing state
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);

        try {
          // Format messages for Gemini api format
          // [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
          const formattedHistory = chatMessages.slice(-8).map(m => ({
            role: m.senderId === currentUser.uid ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

          const response = await fetch('/api/ai/scholar-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scholarId: dummyId,
              messages: formattedHistory
            })
          });

          if (!response.ok) {
            throw new Error('Scholar is in deep meditation. Try later.');
          }

          const resJson = await response.json();
          const replyText = resJson.text || "I am currently focused in silence. Focus on what lies in your power.";

          // Now save this auto response in Firestore messages list under the dummy scholar's name
          const msgRef = doc(collection(db, 'conversations', activeChat.id, 'messages'));
          const msgPayload: DMMessage = {
            id: msgRef.id,
            conversationId: activeChat.id,
            senderId: dummyId,
            senderName: scholarName,
            text: replyText,
            createdAt: new Date().toISOString()
          };

          await setDoc(msgRef, msgPayload);

          // Update head conversation document
          const convoRef = doc(db, 'conversations', activeChat.id);
          await updateDoc(convoRef, {
            lastMessage: replyText,
            lastMessageAt: new Date().toISOString()
          });

        } catch (err) {
          console.error("Scholar response generation failed:", err);
        } finally {
          setDummyTypingState(null);
          // Wait brief delay then scroll to reply message
          setTimeout(() => {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }

      }, 1500); // 1.5s human-like response delay

      return () => clearTimeout(replyTimer);
    }
  }, [chatMessages, activeChat, currentUser]);

  // Peer Wall overlay sync
  useEffect(() => {
    if (!selectedPeerWall) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef,
      where('userId', '==', selectedPeerWall.uid),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const snapUnsub = onSnapshot(q, (snap) => {
      const f: CommunityPost[] = [];
      snap.forEach((d) => {
        f.push({ id: d.id, ...d.data() } as CommunityPost);
      });
      setPeerWallPosts(f);
    });

    return () => snapUnsub();
  }, [selectedPeerWall]);

  // Action: Create a social post (Defaults to pending unless admin)
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPostContent.trim()) return;

    setIsPosting(true);
    setPostError(null);

    try {
      const postDocRef = doc(collection(db, 'social_posts'));
      
      const draftPost: CommunityPost = {
        id: postDocRef.id,
        userId: currentUser.uid,
        userName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        userAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        content: newPostContent,
        mediaType: newPostMediaType,
        mediaUrl: newPostMediaUrl.trim() || undefined,
        status: isAdmin ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
        likes: []
      };

      await setDoc(postDocRef, draftPost);
      
      // Reset inputs
      setNewPostContent('');
      setNewPostMediaType('none');
      setNewPostMediaUrl('');
      
      // Notify user check
      if (!isAdmin) {
        setPostError("Draft transmitted! Your reflection has been sent to Petar's queue for moderation.");
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'social_posts');
      setPostError("Failed to transmit post. Schema boundary restrictions occurred.");
    } finally {
      setIsPosting(false);
    }
  };

  // Action: Toggle Like on Post
  const handleToggleLike = async (post: CommunityPost) => {
    if (!currentUser) return;
    try {
      const hasLiked = post.likes?.includes(currentUser.uid);
      const postRef = doc(db, 'social_posts', post.id);

      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `social_posts/${post.id}/likes`);
    }
  };

  // Action: Friend Request Operations
  const handleSendFriendRequest = async (peer: PublicProfile) => {
    if (!currentUser) return;
    const sortedIds = [currentUser.uid, peer.uid].sort();
    const requestId = `${sortedIds[0]}_${sortedIds[1]}`;
    try {
      if (peer.uid.startsWith('dummy_')) {
        // Auto-accept dummy friend requests instantly!
        await setDoc(doc(db, 'friend_requests', requestId), {
          id: requestId,
          senderId: currentUser.uid,
          senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
          senderAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          receiverId: peer.uid,
          status: 'accepted',
          createdAt: new Date().toISOString()
        });

        // Also update my own friends list
        const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
        await updateDoc(myProfileRef, {
          friends: arrayUnion(peer.uid)
        });
      } else {
        await setDoc(doc(db, 'friend_requests', requestId), {
          id: requestId,
          senderId: currentUser.uid,
          senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
          senderAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          receiverId: peer.uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `friend_requests/${requestId}`);
    }
  };

  const handleAcceptFriendRequest = async (req: any) => {
    try {
      // Update request status to accepted
      await updateDoc(doc(db, 'friend_requests', req.id), {
        status: 'accepted'
      });

      // Update my own profile friends list for redundancy/backup
      const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
      await updateDoc(myProfileRef, {
        friends: arrayUnion(req.senderId)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `friend_requests/${req.id}`);
    }
  };

  const handleDeclineFriendRequest = async (req: any) => {
    try {
      // Direct delete on decline/cancel to allow fresh requests in future
      await deleteDoc(doc(db, 'friend_requests', req.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `friend_requests/${req.id}`);
    }
  };

  const handleRemoveFriend = async (peerId: string) => {
    if (!currentUser) return;
    // Compute deterministic request ID
    const sortedIds = [currentUser.uid, peerId].sort();
    const requestId = `${sortedIds[0]}_${sortedIds[1]}`;
    try {
      // Delete request document
      await deleteDoc(doc(db, 'friend_requests', requestId));

      // Sever relation from my own profile list as well
      const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
      await updateDoc(myProfileRef, {
        friends: arrayRemove(peerId)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `friend_requests/${requestId}`);
    }
  };

  // Action: Direct Message initiate with a Peer
  const handleStartDM = async (peerProfile: PublicProfile) => {
    if (!currentUser) return;
    
    // Sort UIDs to compute deterministic ID for the direct exchange node
    const sortedIds = [currentUser.uid, peerProfile.uid].sort();
    const convoId = `${sortedIds[0]}_${sortedIds[1]}`;

    try {
      const convoRef = doc(db, 'conversations', convoId);
      const convoDoc = await getDoc(convoRef);

      const computedConvo: Conversation = {
        id: convoId,
        participants: sortedIds,
        participantNames: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : peerProfile.name,
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : peerProfile.name
        ],
        participantAvatars: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (peerProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (peerProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
        ]
      };

      if (!convoDoc.exists()) {
        await setDoc(convoRef, computedConvo);
      }

      setActiveChat(computedConvo);
      setActiveTab('messages');
      setSelectedPeerWall(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convoId}`);
    }
  };

  // Action: Submit instant dialogue transmission in dialogue box
  const handleSendInstantEngageMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !engagePeer || !engageMessage.trim()) return;

    setIsSendingEngage(true);
    setEngageError(null);

    const sortedIds = [currentUser.uid, engagePeer.uid].sort();
    const convoId = `${sortedIds[0]}_${sortedIds[1]}`;

    try {
      const convoRef = doc(db, 'conversations', convoId);
      const convoDoc = await getDoc(convoRef);

      const computedConvo: Conversation = {
        id: convoId,
        participants: sortedIds,
        participantNames: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : engagePeer.name,
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : engagePeer.name
        ],
        participantAvatars: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
        ]
      };

      if (!convoDoc.exists()) {
        await setDoc(convoRef, {
          ...computedConvo,
          lastMessage: engageMessage,
          lastMessageAt: new Date().toISOString()
        });
      }

      // Add message under collection
      const msgRef = doc(collection(db, 'conversations', convoId, 'messages'));
      const msgPayload: DMMessage = {
        id: msgRef.id,
        conversationId: convoId,
        senderId: currentUser.uid,
        senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        text: engageMessage,
        createdAt: new Date().toISOString()
      };

      await setDoc(msgRef, msgPayload);

      // Only update head if it already existed (prevent dual uncommitted write trigger in security rules)
      if (convoDoc.exists()) {
        await updateDoc(convoRef, {
          lastMessage: engageMessage,
          lastMessageAt: new Date().toISOString()
        });
      }

      setEngageSuccess(true);
      
      // Navigate and close after a brief triumph delay
      setTimeout(() => {
        setActiveChat(computedConvo);
        setActiveTab('messages');
        setSelectedPeerWall(null);
        setEngagePeer(null);
        setEngageMessage('');
        setIsSendingEngage(false);
        setEngageSuccess(false);
      }, 1500);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convoId}/messages`);
      setEngageError("The scholarly channels are congested. Unable to transmit payload.");
      setIsSendingEngage(false);
    }
  };

  // Action: Send direct message inside active DM channel
  const handleSendDMMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChat || !newMessageText.trim()) return;

    try {
      const convoRef = doc(db, 'conversations', activeChat.id);
      const msgRef = doc(collection(db, 'conversations', activeChat.id, 'messages'));

      const msgPayload: DMMessage = {
        id: msgRef.id,
        conversationId: activeChat.id,
        senderId: currentUser.uid,
        senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        text: newMessageText,
        createdAt: new Date().toISOString()
      };

      // 1. Submit message payload
      await setDoc(msgRef, msgPayload);

      // 2. Update head node for active list sorting
      await updateDoc(convoRef, {
        lastMessage: newMessageText,
        lastMessageAt: new Date().toISOString()
      });

      setNewMessageText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${activeChat.id}/messages`);
    }
  };

  // Action: Admin Moderate approval
  const handleModeratePost = async (postId: string, action: 'approve' | 'reject') => {
    try {
      const postRef = doc(db, 'social_posts', postId);
      await updateDoc(postRef, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `social_posts/${postId}`);
    }
  };

  // Safe YouTube embedding processor
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Handles watch?v=ID, youtu.be/ID, embed/ID, Shorts URLs
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch (e) {
      return '';
    }
  };

  // Safe TikTok check
  const isTikTokUrl = (url: string) => {
    return url.includes('tiktok.com');
  };

  // Connection evaluation filters
  const incomingPending = friendRequests.filter(r => r.status === 'pending');

  const acceptedFriendIds = React.useMemo(() => {
    const ids = new Set<string>();
    friendRequests.forEach(r => {
      if (r.status === 'accepted') ids.add(r.senderId);
    });
    sentRequests.forEach(r => {
      if (r.status === 'accepted') ids.add(r.receiverId);
    });
    return ids;
  }, [friendRequests, sentRequests]);

  const isPeerOnline = (p: PublicProfile) => {
    if (!p.isOnline) return false;
    if (!p.lastActive) return false;
    const lastActiveTime = new Date(p.lastActive).getTime();
    const now = Date.now();
    // Support diverse system clocks with a robust 15-minute window and Math.abs
    return Math.abs(now - lastActiveTime) < 15 * 60 * 1000;
  };

  const getFriendRelation = (peerUid: string) => {
    if (acceptedFriendIds.has(peerUid)) {
      return 'friend';
    }
    const outgoing = sentRequests.find(r => r.receiverId === peerUid);
    if (outgoing) {
      return outgoing.status; // 'pending' | 'rejected'
    }
    const incoming = friendRequests.find(r => r.senderId === peerUid);
    if (incoming) {
      return incoming.status === 'pending' ? 'incoming' : incoming.status;
    }
    return 'none';
  };

  const [peerFilter, setPeerFilter] = useState<'all' | 'friends'>('all');

  // Filtered peers list
  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
      (peer.biography?.toLowerCase() || '').includes(peerSearchQuery.toLowerCase());

    if (peerFilter === 'friends') {
      return matchesSearch && acceptedFriendIds.has(peer.uid);
    }
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* 1. Profile Setup Modal/Prompt */}
      <AnimatePresence>
        {isSettingUpProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-tight">Record Seeker Bio</h3>
                    <p className={cn("text-[11px]", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>Introduce yourself to the intellectual swarm</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 text-xs rounded-xl border font-medium focus:ring-1 focus:ring-emerald-500 outline-none",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                      placeholder="Your academic title or pseudonym"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Biography</label>
                    <textarea 
                      value={setupBiography}
                      onChange={(e) => setSetupBiography(e.target.value)}
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 text-xs rounded-xl border font-medium focus:ring-1 focus:ring-emerald-500 outline-none resize-none",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                      placeholder="What field of inquiry or athletic pursuit guides your existence? Under what terms do you run?"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={handleSavePublicProfile}
                    className="flex-1 py-3 bg-emerald-500 text-zinc-950 rounded-2xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
                  >
                    Establish Presence
                  </button>
                  {thisPublicProfile && (
                    <button 
                      onClick={() => setIsSettingUpProfile(false)}
                      className={cn(
                        "px-4 py-3 border rounded-2xl font-bold text-xs uppercase tracking-wider",
                        isDarkMode ? "border-zinc-800 text-zinc-400 hover:text-white" : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Instant Engage Dialogue Box Modal */}
        {engagePeer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <button 
                type="button"
                onClick={() => setEngagePeer(null)}
                className={cn(
                  "absolute top-4 right-4 p-1.5 rounded-lg transition-colors border",
                  isDarkMode 
                    ? "border-zinc-800 hover:border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                    : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
                )}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img 
                      src={engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-500/10"
                      alt="avatar"
                      referrerPolicy="no-referrer"
                    />
                    {isPeerOnline(engagePeer) ? (
                      <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-zinc-900"></span>
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-zinc-655 border border-zinc-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <h3 className="font-black text-sm uppercase tracking-wider">{engagePeer.name}</h3>
                      <span className={cn(
                        "text-[7px] font-mono font-black tracking-widest px-1 py-0.5 rounded border",
                        isPeerOnline(engagePeer) 
                          ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/15" 
                          : "text-zinc-500 bg-zinc-400/5 border-zinc-400/10"
                      )}>
                        {isPeerOnline(engagePeer) ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1 font-bold uppercase tracking-widest text-emerald-500">Initiating Scholarly Dialogue</p>
                  </div>
                </div>

                {engageSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <Check className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-500">Dialogue Channel Established</p>
                      <p className={cn("text-[10px] mt-1 max-w-[280px]", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                        Your message has been safely queued and transmitted. Navigating to personal conversations...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendInstantEngageMessage} className="space-y-4 pt-2">
                    <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-550")}>
                      {!isPeerOnline(engagePeer) ? (
                        <span>
                          <strong>{engagePeer.name}</strong> is currently living silently in contemplation. You can transcribe an offline dialogue transmission which they will receive immediately upon re-entering.
                        </span>
                      ) : (
                        <span>
                          Transcribe immediate thoughts, structured inquiries, or rigorous critiques directly into <strong>{engagePeer.name}</strong>'s private network node.
                        </span>
                      )}
                    </p>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Dialogue Transmission</label>
                      <textarea 
                        value={engageMessage}
                        onChange={(e) => setEngageMessage(e.target.value)}
                        rows={4}
                        required
                        disabled={isSendingEngage || isUploadingFile}
                        className={cn(
                          "w-full px-4 py-3 text-lg rounded-xl border focus:ring-1 focus:ring-emerald-500 outline-none resize-none font-handwritten",
                          isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-550" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
                        )}
                        placeholder="Establish clarity, speak with discipline, and build intellectual/biometric alignment..."
                      />
                    </div>

                    {/* Emojis selection & file uploads row bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                        {['🧘', '🧠', '💪', '🏛️', '⚓', '📜', '🛡️', '⏳'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEngageMessage(prev => prev + emoji)}
                            className={cn(
                              "w-7 h-7 flex items-center justify-center text-sm rounded-lg border transition-all active:scale-95 shrink-0",
                              isDarkMode 
                                ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300" 
                                : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                         <label className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-lg border cursor-pointer transition-all hover:bg-emerald-500/10 active:scale-95 shrink-0",
                          isUploadingFile ? "animate-pulse" : "",
                          isDarkMode 
                            ? "bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-emerald-400" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-505 hover:text-emerald-600"
                        )}>
                          <Paperclip className="w-3.5 h-3.5" />
                          <input 
                            type="file" 
                            className="hidden" 
                            disabled={isUploadingFile || isSendingEngage} 
                            onChange={(e) => handleFileUpload(e, true)} 
                            accept="image/*,video/mp4,application/pdf"
                          />
                        </label>
                        {isUploadingFile && (
                          <span className="text-[9px] font-mono text-emerald-500 animate-pulse">Uploading...</span>
                        )}
                      </div>
                    </div>

                    {engageError && (
                      <p className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl">
                        {engageError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="submit"
                        disabled={isSendingEngage || !engageMessage.trim() || isUploadingFile}
                        className={cn(
                          "flex-1 py-3 bg-emerald-500 text-zinc-950 rounded-2xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20",
                          (isSendingEngage || !engageMessage.trim() || isUploadingFile) && "opacity-55 pointer-events-none"
                        )}
                      >
                        {isSendingEngage ? "Transmitting..." : "Transmit Dialogue"} <Send className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEngagePeer(null)}
                        className={cn(
                          "px-4 py-3 border rounded-2xl font-bold text-xs uppercase tracking-wider",
                          isDarkMode ? "border-zinc-800 text-zinc-400 hover:text-white" : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                        )}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Banner Header card */}
      <div className={cn(
        "p-6 rounded-3xl border relative overflow-hidden transition-all duration-500",
        isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      )}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] select-none pointer-events-none">
          <Globe className="w-56 h-56 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                P2P SCHOLAR SWARM
              </span>
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">The Commons Sanctuary</h2>
            <p className={cn("text-xs leading-relaxed max-w-xl", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
              Step into the collective intelligence loop. Share biometric breakthroughs, log physical records, evaluate research-backed articles, or establish quiet communication with other disciples.
            </p>
          </div>
          <button 
            onClick={() => {
              setSetupBiography(thisPublicProfile?.biography || '');
              setSetupName(thisPublicProfile?.name || userProfile?.name || '');
              setIsSettingUpProfile(true);
            }}
            className={cn(
              "self-start md:self-center px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
              isDarkMode 
                ? "border-zinc-800 hover:border-zinc-700 bg-zinc-850 text-zinc-400 hover:text-white" 
                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
            )}
          >
            My Biography Card
          </button>
        </div>
      </div>

      {/* 3. Segment Tab Switcher */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-zinc-800/20">
        {[
          { id: 'feed', label: 'Scholarly Feed', icon: <Globe className="w-4 h-4" /> },
          { id: 'messages', label: 'Direct Dialogs', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'peers', label: 'Seekers Swarm', icon: <Users className="w-4 h-4" /> },
          { id: 'moderation', label: `Moderation (${pendingPosts.length})`, icon: <ShieldCheck className="w-4 h-4" />, adminOnly: true }
        ].map(tab => {
          if (tab.adminOnly && !isAdmin) return null;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap",
                active 
                  ? "bg-emerald-500 text-zinc-950 font-black italic scale-[0.98]" 
                  : isDarkMode
                    ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Context Views */}
      <div className="space-y-6">
        
        {/* TAB A: SCHOLARLY FEED */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Main feed feed - Column 2 span */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Draft Creator Form */}
              <form onSubmit={handlePostSubmit} className={cn(
                "p-5 rounded-3xl border transition-all duration-300 space-y-4",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-start gap-3">
                  <img 
                    src={thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-500/10"
                    alt="avatar"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Discharge some research, clinical workouts, or hard-boiled philosophy..."
                      rows={3}
                      maxLength={4000}
                      className={cn(
                        "w-full text-xs font-medium outline-none border-0 bg-transparent resize-none focus:ring-0",
                        isDarkMode ? "text-white placeholder-zinc-500" : "text-zinc-900 placeholder-zinc-400"
                      )}
                    />
                  </div>
                </div>

                {/* Optional Media attachments choice bar */}
                <div className="pt-2 border-t border-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Attach:</span>
                    <select
                      value={newPostMediaType}
                      onChange={(e) => {
                        setNewPostMediaType(e.target.value as any);
                        setNewPostMediaUrl('');
                      }}
                      className={cn(
                        "px-2 py-1 text-[10px] font-black uppercase rounded-lg border outline-none",
                        isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-650"
                      )}
                    >
                      <option value="none">None</option>
                      <option value="image">Image Link</option>
                      <option value="youtube">YouTube Embed</option>
                      <option value="tiktok">TikTok Video</option>
                    </select>

                    {newPostMediaType !== 'none' && (
                      <input 
                        type="url"
                        value={newPostMediaUrl}
                        onChange={(e) => setNewPostMediaUrl(e.target.value)}
                        placeholder={
                          newPostMediaType === 'youtube' ? 'YouTube watch/share URL' :
                          newPostMediaType === 'tiktok' ? 'TikTok URL' : 'Image attachment URL'
                        }
                        className={cn(
                          "flex-1 px-3 py-1 text-[10px] rounded-lg border outline-none max-w-[150px] sm:max-w-xs",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                        )}
                        required
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPosting || !newPostContent.trim()}
                    className={cn(
                      "px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 self-end",
                      (isPosting || !newPostContent.trim()) && "opacity-50 pointer-events-none"
                    )}
                  >
                    {isPosting ? 'Transmitting...' : 'Transmit Reflect'}
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {/* Notification/Grader Warning message */}
                {postError ? (
                  <div className={cn(
                    "p-3.5 rounded-2xl border flex items-start gap-2.5 text-[10px] leading-relaxed font-bold transition-all",
                    postError.includes('transmitted') 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  )}>
                    {postError.includes('transmitted') ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <p>{postError}</p>
                      {!isAdmin && postError.includes('transmitted') && (
                        <p className="mt-1 font-normal opacity-90 text-[9px] uppercase tracking-normal">
                          💡 Planned Feature: Upgraded semantic auto-grader will assess draft's philosophical density prior to auto-publishing.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "p-3 rounded-2xl border text-[10px] leading-relaxed flex items-center gap-2",
                    isDarkMode ? "bg-zinc-850/50 border-zinc-800/80 text-zinc-500" : "bg-zinc-50 border-zinc-150 text-zinc-400"
                  )}>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500/70 animate-pulse" />
                    <span className="font-medium">
                      All seeker reflections undergo rigorous manual peer moderation by Petar to isolate high signals.
                    </span>
                  </div>
                )}
              </form>

              {/* Feed Lists Render */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No approved community reflections have entered the sanctuary yet. Write the first draft!
                  </div>
                ) : (
                  posts.map(post => {
                    const embedYt = post.mediaType === 'youtube' && post.mediaUrl ? getYouTubeEmbedUrl(post.mediaUrl) : '';
                    const hasLiked = post.likes?.includes(currentUser?.uid);
                    
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-5 rounded-3xl border transition-all duration-300 space-y-4 relative overflow-hidden",
                          isDarkMode ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200 shadow-sm"
                        )}
                      >
                        {/* Header author alignment */}
                        <div className="flex items-center justify-between">
                          <button 
                            type="button"
                            onClick={() => {
                              if (post.userId === currentUser.uid) {
                                setActiveTab('peers'); // Or view biography. Let's load peer bio list
                              } else {
                                const matched = peers.find(p => p.uid === post.userId);
                                if (matched) {
                                  setSelectedPeerWall(matched);
                                } else {
                                  // Fallback mock
                                  setSelectedPeerWall({
                                    uid: post.userId,
                                    name: post.userName,
                                    avatarUrl: post.userAvatar,
                                    biography: 'No expanded biography recorded by seeker.'
                                  });
                                }
                              }
                            }}
                            className="flex items-center gap-2.5 text-left group"
                          >
                            <img 
                              src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border border-zinc-500/10 group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                                {post.userName}
                              </p>
                              <p className={cn("text-[9px] font-mono", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </button>

                          {/* Like heart metrics */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleLike(post)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                hasLiked 
                                  ? "text-red-500 bg-red-500/10" 
                                  : isDarkMode 
                                    ? "text-zinc-500 hover:text-white hover:bg-zinc-800" 
                                    : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                              )}
                            >
                              <Heart className={cn("w-4 h-4", hasLiked && "fill-current animate-ping-once")} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Middle Text Area */}
                        <p className={cn("text-xs leading-relaxed font-normal whitespace-pre-wrap", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>
                          {post.content}
                        </p>

                        {/* Media rendering section */}
                        {post.mediaType === 'image' && post.mediaUrl && (
                          <div className="rounded-2xl overflow-hidden border border-zinc-800/20 max-h-80 bg-zinc-950">
                            <img 
                              src={post.mediaUrl} 
                              alt="attachment" 
                              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1518152006812-cdff2f4a4c35?auto=format&fit=crop&q=80&w=600';
                              }}
                            />
                          </div>
                        )}

                        {post.mediaType === 'youtube' && embedYt && (
                          <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800/20 bg-zinc-950">
                            <iframe 
                              src={embedYt}
                              title="community_yt"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {post.mediaType === 'tiktok' && post.mediaUrl && (
                          <div className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between gap-3 bg-zinc-950/20 border-zinc-800",
                            isDarkMode ? "bg-zinc-900/60" : "bg-zinc-50 border-zinc-200"
                          )}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center border border-zinc-800">
                                <Video className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-wider">TikTok Educational Segment</p>
                                <p className={cn("text-[9px] max-w-[200px] truncate", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                  URL: {post.mediaUrl}
                                </p>
                              </div>
                            </div>
                            <a 
                              href={post.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-3.5 py-1.5 bg-emerald-500 text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 select-none"
                            >
                              Open Clip <ExternalLinkIcon className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar quick insights column */}
            <div className="space-y-6">
              
              {/* Educational grade explainer */}
              <div className={cn(
                "p-5 rounded-3xl border space-y-4",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Academic Grade Concept</h4>
                </div>
                <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>
                  Under **Strategic Path D**, this application is preparing to host an automated **Educational IQ Grader**.
                </p>
                <div className="space-y-2 text-[10px] font-semibold">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-zinc-800/10 border border-zinc-800/30">
                    <span className="text-zinc-400">Philosophical Weight</span>
                    <span className="text-emerald-500">Auto evaluation</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-zinc-800/10 border border-zinc-800/30">
                    <span className="text-zinc-400">Hate & Dopamine Filters</span>
                    <span className="text-purple-400">Auto screen</span>
                  </div>
                </div>
                <p className={cn("text-[10px] leading-relaxed italic", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                  Every post will undergo structured multi-grade analyses using custom Gemini embeddings before entering the public scholarly feed automatically. Zero noise space.
                </p>
              </div>

              {/* General list stats */}
              <div className={cn(
                "p-5 rounded-3xl border space-y-3",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Disciples Near You</h4>
                </div>
                <div className="space-y-2 pt-1">
                  {peers.slice(0, 4).map(peer => {
                    const online = isPeerOnline(peer);
                    return (
                      <button 
                        key={peer.uid}
                        onClick={() => {
                          setEngagePeer(peer);
                          setEngageMessage('');
                          setEngageSuccess(false);
                          setEngageError(null);
                        }}
                        className={cn(
                          "w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 group transition-all",
                          isDarkMode ? "border-zinc-800/50 hover:bg-zinc-800/20" : "border-zinc-150 hover:bg-zinc-50"
                        )}
                      >
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <div className="relative shrink-0">
                            <img 
                              src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              className="w-6 h-6 rounded-full object-cover"
                              alt="peer"
                              referrerPolicy="no-referrer"
                            />
                            {online && (
                              <span className="absolute bottom-0 right-0 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold truncate group-hover:text-emerald-500 transition-colors">{peer.name}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 shrink-0">Engage →</span>
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setActiveTab('peers')}
                    className="w-full text-center text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-emerald-500 transition-colors pt-1 block"
                  >
                    Browse All {peers.length} Seekers
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB B: DIRECT DIALOGS / MESSAGES */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            
            {/* Conversation list pane */}
            <div className={cn(
              "p-4 rounded-3xl border flex flex-col h-full",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm",
              activeChat ? "hidden md:flex" : "flex"
            )}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-3 px-1 text-zinc-400">Conversations</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-[10px] text-zinc-500">
                    No historic dialogs. Establish paths by selecting a scholar in the Seekers Swarm tab!
                  </div>
                ) : (
                  conversations.map(convo => {
                    const otherIndex = convo.participants[0] === currentUser.uid ? 1 : 0;
                    const otherUid = convo.participants[otherIndex];
                    const otherName = convo.participantNames[otherIndex] || 'Anonymous';
                    const otherAvatar = convo.participantAvatars ? convo.participantAvatars[otherIndex] : undefined;
                    const active = activeChat?.id === convo.id;

                    const otherPeer = peers.find(p => p.uid === otherUid);
                    const online = otherPeer ? isPeerOnline(otherPeer) : false;

                    return (
                      <button
                        key={convo.id}
                        type="button"
                        onClick={() => setActiveChat(convo)}
                        className={cn(
                          "w-full p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all",
                          active 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                            : isDarkMode 
                              ? "border-zinc-800/80 hover:bg-zinc-800/20 text-white" 
                              : "border-zinc-150 hover:bg-zinc-50 text-zinc-800"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={otherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            className="w-7 h-7 rounded-full object-cover border border-zinc-500/10"
                            alt="usr"
                            referrerPolicy="no-referrer"
                          />
                          {online && (
                            <span className="absolute bottom-0 right-0 flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-zinc-900"></span>
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-tight truncate flex items-center gap-1.5">
                            {otherName}
                            {online && (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            )}
                          </p>
                          <p className={cn("text-[9px] truncate mt-0.5", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                            {convo.lastMessage || 'Open private exchange loop.'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Active Chat terminal */}
            <div className={cn(
              "md:col-span-2 flex flex-col h-full",
              activeChat ? "flex" : "hidden md:flex"
            )}>
              {activeChat ? (
                <div className={cn(
                  "p-4 rounded-3xl border flex flex-col h-full relative overflow-hidden",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  {/* Active Header user info */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-855 leading-none shrink-0 mb-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const otherIndex = activeChat.participants[0] === currentUser.uid ? 1 : 0;
                        const otherUid = activeChat.participants[otherIndex];
                        const otherPeer = peers.find(p => p.uid === otherUid);
                        const online = otherPeer ? isPeerOnline(otherPeer) : false;
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveChat(null)}
                              className="md:hidden p-1 mr-1 rounded-xl bg-zinc-850 border border-zinc-800 hover:bg-zinc-800 text-emerald-500 transition-colors"
                              title="Back to conversation list"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full select-none",
                              online ? "bg-emerald-500 animate-pulse" : "bg-zinc-650"
                            )} />
                            <h4 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              {activeChat.participants[0] === currentUser.uid 
                                ? activeChat.participantNames[1] 
                                : activeChat.participantNames[0]}
                              <span className={cn(
                                "text-[7px] font-mono",
                                online ? "text-emerald-500" : "text-zinc-500"
                              )}>
                                {online ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            </h4>
                          </>
                        );
                      })()}
                    </div>
                    <button 
                      onClick={() => setActiveChat(null)}
                      className={cn(
                        "p-1 rounded-lg transition-colors",
                        isDarkMode ? "text-zinc-500 hover:text-white hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-850 hover:bg-zinc-100"
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-16 text-[10px] text-zinc-500 italic">
                        Channel cleared. Speak with rigor.
                      </div>
                    ) : (
                      chatMessages.map(msg => {
                        const isMine = msg.senderId === currentUser.uid;
                        return (
                          <div 
                            key={msg.id}
                            className={cn(
                              "flex flex-col max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium border",
                              isMine 
                                ? "self-end bg-emerald-500 text-zinc-950 font-bold ml-auto border-emerald-400/20 rounded-tr-none" 
                                : isDarkMode 
                                  ? "self-start bg-zinc-800/40 border-zinc-800 text-zinc-100 rounded-tl-none" 
                                  : "self-start bg-zinc-55 border-zinc-200 text-zinc-900 rounded-tl-none"
                            )}
                          >
                            {renderMessageTextWithAttachments(msg.text, isMine)}
                            <span className={cn(
                              "text-[8px] self-end mt-1 select-none opacity-60 font-mono",
                              isMine ? "text-zinc-950" : isDarkMode ? "text-zinc-500" : "text-zinc-500"
                            )}>
                              {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    {dummyTypingState && (
                      <div className={cn(
                        "flex items-center gap-2 self-start rounded-2xl px-3.5 py-2.5 text-xs font-semibold border border-dashed rounded-tl-none animate-pulse max-w-[80%] mr-auto w-fit",
                        isDarkMode
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      )}>
                        <span>{dummyTypingState} is responding...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Emoji selection & file uploads row bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                      {['🧘', '🧠', '💪', '🏛️', '⚓', '📜', '🛡️', '⏳'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewMessageText(prev => prev + emoji)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center text-sm rounded-lg border transition-all active:scale-95 shrink-0",
                            isDarkMode 
                              ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300" 
                              : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                       <label className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-lg border cursor-pointer transition-all hover:bg-emerald-500/10 active:scale-95 shrink-0",
                        isUploadingFile ? "animate-pulse" : "",
                        isDarkMode 
                          ? "bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-emerald-400" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-505 hover:text-emerald-600"
                      )}>
                        <Paperclip className="w-3.5 h-3.5" />
                        <input 
                          type="file" 
                          className="hidden" 
                          disabled={isUploadingFile} 
                          onChange={(e) => handleFileUpload(e, false)} 
                          accept="image/*,video/mp4,application/pdf"
                        />
                      </label>
                      {isUploadingFile && (
                        <span className="text-[9px] font-mono text-emerald-500 animate-pulse">Uploading...</span>
                      )}
                    </div>
                  </div>

                  {/* Input sending bottom form */}
                  <form onSubmit={handleSendDMMessage} className="flex gap-2 shrink-0">
                    <input 
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Transcribe peaceful thoughts or structured critiques..."
                      className={cn(
                        "flex-1 px-4 py-3 text-lg rounded-xl border focus:ring-1 focus:ring-emerald-500 outline-none font-handwritten",
                        isDarkMode ? "bg-zinc-850 border-zinc-800 text-white placeholder-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
                      )}
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessageText.trim() || isUploadingFile}
                      className={cn(
                        "p-3 rounded-xl bg-emerald-500 text-zinc-950 active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-emerald-500/10",
                        (!newMessageText.trim() || isUploadingFile) && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              ) : (
                <div className={cn(
                  "p-12 rounded-3xl border flex flex-col items-center justify-center text-center h-full",
                  isDarkMode ? "bg-zinc-900/10 border-zinc-800" : "bg-zinc-50 border-zinc-150"
                )}>
                  <MessageSquare className="w-10 h-10 text-zinc-600 mb-3 animate-bounce-slow" />
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Direct Message Loop</p>
                  <p className={cn("text-[10px] mt-1 max-w-xs", isDarkMode ? "text-zinc-550" : "text-zinc-450")}>
                    Select a conversation from the list or browse active seekers in the swarm tab to open direct lines of inquiry.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB C: SEEKERS SWARMDIRECTORY */}
        {activeTab === 'peers' && (
          <div className="space-y-4">
            
            {/* Search filter input */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="text"
                  value={peerSearchQuery}
                  onChange={(e) => setPeerSearchQuery(e.target.value)}
                  placeholder="Search seekers by codename, bio credentials, or focus areas..."
                  className={cn(
                    "w-full pl-10 pr-4 py-3 text-xs rounded-2xl border outline-none font-medium focus:ring-1 focus:ring-emerald-500",
                    isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-500" : "bg-white border-zinc-250 text-zinc-900 placeholder-zinc-400 shadow-sm"
                  )}
                />
              </div>

              {/* Filtering segmented buttons */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPeerFilter('all')}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all",
                    peerFilter === 'all'
                      ? (isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-900 border-zinc-800 text-white shadow-sm")
                      : isDarkMode
                        ? "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  All Seekers ({peers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPeerFilter('friends')}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all flex items-center gap-1.5",
                    peerFilter === 'friends'
                      ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-black italic shadow-md shadow-emerald-500/10" 
                      : isDarkMode
                        ? "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Checked Friends ({acceptedFriendIds.size})
                </button>
              </div>
            </div>

            {/* Pending Requests component header bucket */}
            {incomingPending.length > 0 && (
              <div className={cn(
                "p-4 rounded-3xl border space-y-3",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
              )}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Pending Connection Requests ({incomingPending.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incomingPending.map(req => (
                    <div 
                      key={req.id} 
                      className={cn(
                        "p-3 rounded-2xl border flex items-center justify-between gap-3",
                        isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-white border-zinc-150 shadow-xs"
                      )}
                    >
                      <div className="flex items-center gap-2 max-w-[170px] min-w-0">
                        <img 
                          src={req.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                          alt="req" 
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-500/10" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] font-bold truncate text-zinc-400">{req.senderName}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleDeclineFriendRequest(req)}
                          className={cn(
                            "p-1.5 rounded-lg border hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all",
                            isDarkMode ? "border-zinc-800" : "border-zinc-200"
                          )}
                          title="Decline"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleAcceptFriendRequest(req)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" /> Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid display */}
            {filteredPeers.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500 italic">
                {peerFilter === 'friends' 
                  ? 'No checked scholar friends matching filters in directory. Secure connection links first!'
                  : 'No active seekers matching search terms were registered.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPeers.map(peer => {
                  const relation = getFriendRelation(peer.uid);
                  const online = isPeerOnline(peer);

                  return (
                    <div
                      key={peer.uid}
                      className={cn(
                        "p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group/card",
                        isDarkMode ? "bg-zinc-900/40 border-zinc-800/80 hover:border-emerald-500/30" : "bg-white border-zinc-200 hover:border-emerald-500/20 shadow-sm"
                      )}
                    >
                      {/* Top Right connection node icon */}
                      <div className="absolute top-4 right-4 z-10">
                        {relation === 'friend' && (
                          <button
                            onClick={() => handleRemoveFriend(peer.uid)}
                            className="p-1.5 rounded-lg border border-emerald-500/25 text-emerald-500 bg-emerald-500/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                            title="Sever Connection"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {relation === 'pending' && (
                          <div 
                            className="p-1.5 rounded-lg border border-zinc-805 text-zinc-500 bg-zinc-950"
                            title="Request Sent (Pending Approval)"
                          >
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                        )}
                        {relation === 'incoming' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const req = friendRequests.find(r => r.senderId === peer.uid);
                                if (req) handleDeclineFriendRequest(req);
                              }}
                              className="p-1 rounded-lg border border-zinc-800 text-zinc-505 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-colors"
                              title="Decline"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const req = friendRequests.find(r => r.senderId === peer.uid);
                                if (req) handleAcceptFriendRequest(req);
                              }}
                              className="p-1 rounded-lg border border-emerald-500/20 text-emerald-555 bg-emerald-500/10 hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
                              title="Accept"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {relation === 'none' && (
                          <button
                            onClick={() => handleSendFriendRequest(peer)}
                            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/25 hover:bg-emerald-500/10 transition-colors"
                            title="Send Connection Request"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 relative z-10 text-xs">
                        <div className="flex items-center gap-2.5 max-w-[85%]">
                          <div className="relative shrink-0">
                            <img 
                              src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              className="w-10 h-10 rounded-full object-cover border border-zinc-500/10"
                              alt="peer"
                              referrerPolicy="no-referrer"
                            />
                            {online ? (
                              <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                            ) : (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-zinc-600 border border-zinc-900 shrink-0"></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black uppercase tracking-tight truncate flex items-center gap-1 text-zinc-200">
                              {peer.name}
                              {online && (
                                <span className="text-[7px] font-mono font-black text-emerald-500 px-1 bg-emerald-550/10 rounded animate-pulse">LIVE</span>
                              )}
                            </h4>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-extrabold uppercase tracking-widest text-center border border-emerald-500/10 inline-block mt-0.5">
                              Seeker
                            </span>
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-[11px] leading-relaxed line-clamp-3 font-normal min-h-[42px] pt-1",
                          isDarkMode ? "text-zinc-400" : "text-zinc-650"
                        )}>
                          {peer.biography || 'No philosopher card established. Living silently in contemplation.'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPeerWall(peer)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border",
                            isDarkMode 
                              ? "border-zinc-805 hover:border-zinc-700 bg-zinc-850 text-zinc-400 hover:text-white" 
                              : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
                          )}
                        >
                          Seeker Wall
                        </button>
                        <button
                          onClick={() => {
                            setEngagePeer(peer);
                            setEngageMessage('');
                            setEngageSuccess(false);
                            setEngageError(null);
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black italic uppercase text-[9px] tracking-wider active:scale-95 transition-transform flex items-center justify-center gap-1 hover:bg-emerald-400"
                        >
                          Engage <Send className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB D: MODERATION ADMIN PANEL */}
        {activeTab === 'moderation' && isAdmin && (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-2xl border flex items-center gap-3",
              isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-55/10 border-amber-200 text-amber-700"
            )}>
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight">Admin Moderation Zone</p>
                <p className="text-[10px] leading-relaxed max-w-xl font-medium mt-0.5 opacity-90">
                  You are validated as Petar or an Admin node. Disciples require active clearance to secure clinical sanity in the scholarly commons. Approve or reject reflections immediately.
                </p>
              </div>
            </div>

            {pendingPosts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-xs">
                The queue is pure. No pending user posts.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map(post => (
                  <motion.div
                    key={post.id}
                    layoutId={`mod-${post.id}`}
                    className={cn(
                      "p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          alt="mod"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{post.userName}</p>
                          <p className={cn("text-[9px] font-mono", isDarkMode ? "text-zinc-550" : "text-zinc-450")}>
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className={cn("text-xs leading-relaxed font-normal whitespace-pre-wrap", isDarkMode ? "text-zinc-300" : "text-zinc-750")}>
                        {post.content}
                      </p>

                      {post.mediaUrl && (
                        <div className="p-2 border rounded-xl border-zinc-800 text-[10px] truncate max-w-sm font-mono text-zinc-400">
                          Media link: {post.mediaUrl}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 self-end">
                      <button
                        onClick={() => handleModeratePost(post.id, 'reject')}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleModeratePost(post.id, 'approve')}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-900 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-transform shadow-md shadow-emerald-500/10"
                      >
                        Approve Publication
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Test Seekers Provisioner Card */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-4 mt-6",
              isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">Test Seekers Provisioner</h4>
                  <p className={cn("text-[10px] mt-0.5", isDarkMode ? "text-zinc-400" : "text-zinc-550")}>
                    Instantly deploy historical stoic scholars as active peers for dialog, messaging, and clinical connection testing.
                  </p>
                </div>
                <Users className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsProvisioningDummy(true);
                    setProvisionError(null);
                    setProvisionSuccess(false);

                    try {
                      const dummyUsers = [
                        {
                          uid: 'dummy_marcus_aurelius',
                          name: 'Marcus Aurelius',
                          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
                          biography: 'Emperor of Rome. Author of Meditations. Focuses on stoic temperance, deep morning journaling, and body callisthenics.',
                          isOnline: true,
                          lastActive: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          friends: []
                        },
                        {
                          uid: 'dummy_seneca_younger',
                          name: 'Lucius Seneca',
                          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
                          biography: 'Imperial Advisor and playwright. Writing dialogues on tranquility and mental equilibrium under load.',
                          isOnline: true,
                          lastActive: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          friends: []
                        },
                        {
                          uid: 'dummy_epictetus',
                          name: 'Epictetus',
                          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
                          biography: 'Born a slave, died a master. Teaching that we suffer not from events, but from our judgment of them.',
                          isOnline: true,
                          lastActive: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          friends: []
                        },
                        {
                          uid: 'dummy_hypatia_alex',
                          name: 'Hypatia',
                          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
                          biography: 'Neoplatonist philosopher, leading astronomer and mathematician. Seeking physical hygiene and structural clarity.',
                          isOnline: true,
                          lastActive: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          friends: []
                        }
                      ];

                      for (const u of dummyUsers) {
                        await setDoc(doc(db, 'public_profiles', u.uid), u);
                      }
                      setProvisionSuccess(true);
                    } catch (err: any) {
                      setProvisionError(err.message || 'Failed to seed dummy seekers');
                    } finally {
                      setIsProvisioningDummy(false);
                    }
                  }}
                  disabled={isProvisioningDummy}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-xs font-black uppercase tracking-tight active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {isProvisioningDummy ? "Provisioning..." : "Provision 4 Stoic Seekers"}
                </button>
              </div>

              {provisionSuccess && (
                <p className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl">
                  Seekers seeded successfully! Epictetus, Marcus Aurelius, Lucius Seneca, and Hypatia are now active inside the Seeker Swarm.
                </p>
              )}
              {provisionError && (
                <p className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {provisionError}
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 5. Custom Seeker Wall Modal display overlay */}
      <AnimatePresence>
        {selectedPeerWall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className={cn(
                "w-full max-w-xl rounded-t-3xl sm:rounded-3xl border p-6 shadow-2xl relative overflow-hidden transition-all duration-300 my-8 max-h-[85vh] flex flex-col",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <button 
                onClick={() => setSelectedPeerWall(null)}
                className={cn(
                  "absolute top-4 right-4 p-1.5 rounded-lg transition-colors z-20",
                  isDarkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-850" : "text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                )}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable interior block */}
              <div className="overflow-y-auto space-y-6 pr-2 flex-1 scrollable-overlay">
                
                {/* Biography card top banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/10 pt-2">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={selectedPeerWall.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-zinc-500/10"
                      alt="avatar"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <h3 className="font-black text-base uppercase tracking-tight leading-none">{selectedPeerWall.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Established Disciple</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setEngagePeer(selectedPeerWall);
                      setEngageMessage('');
                      setEngageSuccess(false);
                      setEngageError(null);
                    }}
                    className="px-4 py-2.5 bg-emerald-500 text-zinc-950 font-black italic uppercase text-[10px] tracking-wider rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 self-start sm:self-center"
                  >
                    Secure Dialog <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Seeker Biography Text */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Philosophy biography</h4>
                  <p className={cn(
                    "text-xs leading-relaxed p-4 rounded-2xl border font-medium whitespace-pre-wrap",
                    isDarkMode ? "bg-zinc-850/40 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-150 text-zinc-650"
                  )}>
                    {selectedPeerWall.biography || 'This seeker choice was deep contemplation. No biography documented.'}
                  </p>
                </div>

                {/* Approved posts (The "Wall") */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Scholarly Wall ({peerWallPosts.length} Approved)
                  </h4>
                  {peerWallPosts.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl text-[11px] text-zinc-500 italic">
                      Zero approved reflections published on this wall yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {peerWallPosts.map(p => {
                        const embedYt = p.mediaType === 'youtube' && p.mediaUrl ? getYouTubeEmbedUrl(p.mediaUrl) : '';
                        const hasLiked = p.likes?.includes(currentUser?.uid);

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "p-4 rounded-2xl border text-xs font-medium space-y-3 transition-colors",
                              isDarkMode ? "bg-zinc-850/30 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-150 text-zinc-700"
                            )}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{p.content}</p>

                            {/* Optional post image rendering */}
                            {p.mediaType === 'image' && p.mediaUrl && (
                              <div className="rounded-xl overflow-hidden max-h-48 border border-zinc-800/10">
                                <img src={p.mediaUrl} className="w-full h-full object-cover" alt="wall-image" />
                              </div>
                            )}

                            {p.mediaType === 'youtube' && embedYt && (
                              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800/10 bg-black">
                                <iframe src={embedYt} className="w-full h-full" title="yt_embed" allowFullScreen />
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-zinc-500">
                              <span>Published {new Date(p.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleToggleLike(p)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                                  <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current text-red-500 animate-ping-once")} />
                                </button>
                                <span>{p.likes?.length || 0} Likes</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline fallback icon helper to prevent typing errors on compile
function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
