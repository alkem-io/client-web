import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { ScrollArea } from '@/crd/primitives/scroll-area';

type MembershipTreeNodeData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
  roles: string[];
  children: MembershipTreeNodeData[];
};

type MembershipsTreeDialogProps = {
  open: boolean;
  onClose: () => void;
  nodes: MembershipTreeNodeData[];
  seeMoreHref?: string;
  createSpaceHref?: string;
};

type TreeNodeProps = {
  node: MembershipTreeNodeData;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
};

function TreeNode({ node, expandedIds, onToggle }: TreeNodeProps) {
  const { t } = useTranslation('crd-dashboard');
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center gap-2 py-1.5">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={() => onToggle(node.id)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? t('dialogs.collapseNode', { name: node.name }) : t('dialogs.expandNode', { name: node.name })
            }
          >
            {isExpanded ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4" aria-hidden="true" />
            )}
          </Button>
        ) : (
          <span className="size-6 shrink-0" />
        )}

        <Avatar className="size-7 shrink-0">
          {node.avatarUrl ? <AvatarImage src={node.avatarUrl} alt="" /> : null}
          <AvatarFallback
            className="text-[10px]"
            style={node.avatarColor ? { backgroundColor: node.avatarColor, color: 'white' } : undefined}
          >
            {node.initials}
          </AvatarFallback>
        </Avatar>

        <a href={node.href} className="text-sm font-medium hover:underline truncate">
          {node.name}
        </a>

        <div className="flex gap-1 shrink-0">
          {node.roles.map(role => (
            <Badge key={role} variant="secondary" className="text-[10px] px-1.5 py-0">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul className="pl-6">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} expandedIds={expandedIds} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MembershipsTreeDialog({
  open,
  onClose,
  nodes,
  seeMoreHref,
  createSpaceHref,
}: MembershipsTreeDialogProps) {
  const { t } = useTranslation('crd-dashboard');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('dialogs.memberships')}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <ul className="space-y-1">
            {nodes.map(node => (
              <TreeNode key={node.id} node={node} expandedIds={expandedIds} onToggle={handleToggle} />
            ))}
          </ul>
        </ScrollArea>

        {(seeMoreHref || createSpaceHref) && (
          <DialogFooter className="sm:justify-start gap-4">
            {seeMoreHref && (
              <a href={seeMoreHref} className="text-sm text-primary hover:underline">
                {t('dialogs.seeMoreSpaces')}
              </a>
            )}
            {createSpaceHref && (
              <a href={createSpaceHref} className="text-sm text-primary hover:underline">
                {t('dialogs.createSpace')}
              </a>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { MembershipTreeNodeData, MembershipsTreeDialogProps };
