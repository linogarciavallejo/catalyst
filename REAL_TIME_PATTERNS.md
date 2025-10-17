# Real-Time Features Implementation Patterns

This document captures the architectural patterns and code examples for the real-time features implemented in Phase 6.6 Part 4.

---

## 🎯 Optimistic Update Pattern

All optimistic updates in the application follow this standardized pattern:

### General Pattern

```typescript
// 1. State management
const [items, setItems] = useState<Item[]>([]);
const [pendingItems, setPendingItems] = useState<Item[]>([]);

// 2. Check if item is pending
const isPending = (itemId: string): boolean => {
  return pendingItems.some(item => item.id === itemId);
};

// 3. Add item with optimistic update
const addItem = async (data: CreateItemRequest): Promise<Item> => {
  // Create optimistic item with temporary ID
  const optimisticItem: Item = {
    id: `pending-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    // other required fields
  };

  // Show immediately
  setPendingItems(prev => [optimisticItem, ...prev]);

  try {
    // Send to server
    const realItem = await server.addItem(data);
    
    // On success: move to confirmed list
    setItems(prev => [realItem, ...prev]);
    setPendingItems(prev => 
      prev.filter(item => item.id !== optimisticItem.id)
    );
    
    // Notify listeners
    listeners.forEach(listener => listener(realItem));
    
    return realItem;
  } catch (error) {
    // On error: rollback
    setPendingItems(prev => 
      prev.filter(item => item.id !== optimisticItem.id)
    );
    throw error;
  }
};
```

### Voting Example

```typescript
const [pendingVotes, setPendingVotes] = useState<Record<string, VoteType>>({});

const submitVote = async (ideaId: string, voteType: VoteType): Promise<void> => {
  // 1. Show vote immediately
  setPendingVotes(prev => ({
    ...prev,
    [ideaId]: voteType
  }));

  try {
    // 2. Send to server
    await votesService.submitVote(ideaId, voteType);
    
    // 3. Confirm (remove from pending)
    setPendingVotes(prev => {
      const updated = { ...prev };
      delete updated[ideaId];
      return updated;
    });
  } catch (error) {
    // 4. Rollback on error
    setPendingVotes(prev => {
      const updated = { ...prev };
      delete updated[ideaId];
      return updated;
    });
    throw error;
  }
};

const isPending = (ideaId: string): boolean => {
  return ideaId in pendingVotes;
};
```

### Comment Example

```typescript
const [comments, setComments] = useState<Comment[]>([]);
const [pendingComments, setPendingComments] = useState<Comment[]>([]);

const addComment = async (request: CreateCommentRequest): Promise<Comment> => {
  // 1. Create optimistic comment
  const optimisticComment: Comment = {
    id: `pending-${Date.now()}`,
    ideaId: request.ideaId,
    content: request.content,
    author: getCurrentUser(),
    authorId: getCurrentUser().id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 2. Show immediately (pending state)
  setPendingComments(prev => [optimisticComment, ...prev]);

  try {
    // 3. Send to server
    const realComment = await commentsService.addComment(request);
    
    // 4. Move to confirmed
    setComments(prev => [realComment, ...prev]);
    setPendingComments(prev => 
      prev.filter(c => c.id !== optimisticComment.id)
    );
    
    return realComment;
  } catch (error) {
    // 5. Rollback
    setPendingComments(prev => 
      prev.filter(c => c.id !== optimisticComment.id)
    );
    throw error;
  }
};
```

---

## 🔌 Connection Management Pattern

### Connection State Hook

```typescript
export interface ConnectionStateType {
  isConnected: boolean;
  connectionType: 'websocket' | 'rest' | 'offline';
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

export interface UseConnectionStateReturn extends ConnectionStateType {
  reconnect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export const useConnectionState = (): UseConnectionStateReturn => {
  const [state, setState] = useState<ConnectionStateType>({
    isConnected: true,
    connectionType: 'rest',
    lastConnected: new Date(),
    reconnectAttempts: 0,
    error: null,
  });

  // Auto-reconnect with exponential backoff
  const reconnect = useCallback(async () => {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts && !state.isConnected) {
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        // Attempt to reconnect
        setState(prev => ({
          ...prev,
          reconnectAttempts: attempts + 1,
        }));
        
        // Connection successful
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionType: 'websocket',
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: null,
        }));
        return;
      } catch (error) {
        attempts++;
      }
    }

    // All attempts failed
    setState(prev => ({
      ...prev,
      error: 'Failed to reconnect',
    }));
  }, [state.isConnected]);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionType: 'rest',
      }));
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionType: 'offline',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...state,
    reconnect,
    disconnect: () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionType: 'offline',
      }));
    },
    clearError: () => {
      setState(prev => ({
        ...prev,
        error: null,
      }));
    },
  };
};
```

---

## 📢 Real-Time Listener Pattern

### Hook Event Registration

```typescript
type Listener<T> = (data: T) => void;

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaCreatedListeners, setIdeaCreatedListeners] = useState<
    Listener<Idea>[]
  >([]);

  // Register listener
  const onIdeaCreated = useCallback(
    (callback: Listener<Idea>) => {
      setIdeaCreatedListeners(prev => [...prev, callback]);
    },
    []
  );

  // Create idea - notify listeners on success
  const createIdea = useCallback(async (data: CreateIdeaRequest) => {
    // ... optimistic update logic ...
    try {
      const newIdea = await IdeasService.createIdea(data);
      
      // Notify all listeners
      ideaCreatedListeners.forEach(listener => listener(newIdea));
      
      return newIdea;
    } catch (error) {
      // ... rollback ...
    }
  }, [ideaCreatedListeners]);

  return {
    ideas,
    createIdea,
    onIdeaCreated,
    // ...other methods
  };
};
```

### Using Listeners in Components

```typescript
useEffect(() => {
  // Register listener for real-time updates
  ideas.onIdeaCreated((newIdea) => {
    // Update local state when server broadcasts new idea
    setDisplayedIdeas(prev => [newIdea, ...prev]);
  });
}, []);
```

---

## 🎨 UI State Pattern

### Pending Badge Component

```typescript
interface IdeaCardProps {
  idea: Idea;
  isPending?: boolean;
  isPendingVote?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isPending = false,
  isPendingVote = false,
}) => {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">
            {idea.title}
            {isPending && (
              <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                Posting...
              </span>
            )}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <Badge>{idea.status}</Badge>
          {isPendingVote && (
            <Badge variant="warning">Updating...</Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
```

### Using Pending Flags in Pages

```typescript
const IdeasBrowsingPage: React.FC = () => {
  const { ideas, pendingIdeas, isPending } = useIdeas();
  const { isPending: isVotePending } = useVoting();

  return (
    <div>
      {displayedIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          isPending={isPending(idea.id)}
          isPendingVote={isVotePending(idea.id)}
          onVote={handleVote}
        />
      ))}
    </div>
  );
};
```

---

## 🔄 State Update Ordering

The application uses this specific ordering for state updates to ensure consistency:

```typescript
// CORRECT ORDER:
1. Update UI with optimistic data immediately
2. Send request to server
3. On success: move to confirmed state
4. Notify real-time listeners
5. On error: rollback to previous state

// WRONG (don't do this):
1. Send request to server
2. Wait for response
3. Update UI
   → User sees delay, frustrating experience
```

---

## ❌ Error Handling Pattern

### Rollback on Error

```typescript
const addItem = async (data: ItemData) => {
  const optimisticItem = createOptimistic(data);
  setPendingItems(prev => [optimisticItem, ...prev]);

  try {
    const realItem = await server.add(data);
    // Success path...
  } catch (error) {
    // Rollback: Remove optimistic item
    setPendingItems(prev => 
      prev.filter(item => item.id !== optimisticItem.id)
    );

    // Show error to user
    showError(`Failed to add item: ${error.message}`);
    
    // Re-throw for component error handling
    throw error;
  }
};
```

### Component Error Handling

```typescript
const handleAddItem = async () => {
  try {
    await addItem(formData);
    // Success feedback
    showSuccess('Item added successfully!');
  } catch (error) {
    // Error already shown and state rolled back
    // Just need to handle component-level state
    setIsSubmitting(false);
  }
};
```

---

## 📊 Performance Optimizations

### Pending Items Sorting

```typescript
// Always float pending items to top regardless of sort
const sortIdeas = (ideas: Idea[], sortBy: string) => {
  return ideas.sort((a, b) => {
    // Pending items always come first
    const aIsPending = a.id.startsWith('pending-');
    const bIsPending = b.id.startsWith('pending-');
    
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;
    
    // Then apply normal sorting
    switch (sortBy) {
      case 'popular':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });
};
```

### Preventing Duplicate Submissions

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return; // Prevent double-click
  
  try {
    setIsSubmitting(true);
    await submitItem(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🧪 Testing Patterns

### Testing Optimistic Updates

```typescript
test('should show comment immediately before server confirms', async () => {
  const { getByText } = render(<IdeaDetailPage ideaId="123" />);
  
  // Type and submit comment
  const input = screen.getByPlaceholderText('Add a comment...');
  await userEvent.type(input, 'Test comment');
  await userEvent.click(screen.getByText('Post'));
  
  // Comment should appear immediately
  expect(getByText('Test comment')).toBeInTheDocument();
  
  // Should have pending indicator
  expect(getByText('Posting...')).toBeInTheDocument();
  
  // Wait for server confirmation
  await waitFor(() => {
    expect(queryByText('Posting...')).not.toBeInTheDocument();
  });
});

test('should rollback comment on error', async () => {
  mockCommentService.addComment.mockRejectedValue(
    new Error('Server error')
  );
  
  const { getByText, queryByText } = render(<IdeaDetailPage />);
  
  // Add comment
  await userEvent.type(input, 'Test');
  await userEvent.click(screen.getByText('Post'));
  
  // Should appear then disappear on error
  expect(getByText('Test')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(queryByText('Test')).not.toBeInTheDocument();
  });
});
```

---

## 📚 Summary

The patterns established in Phase 6.6 Part 4 provide:

1. **Consistency** - Same pattern across all operations
2. **Reliability** - Automatic rollback on errors
3. **Performance** - Instant user feedback
4. **Maintainability** - Clear, predictable code structure
5. **Scalability** - Foundation for advanced real-time features

These patterns should be followed for any future optimistic operations added to the application.

