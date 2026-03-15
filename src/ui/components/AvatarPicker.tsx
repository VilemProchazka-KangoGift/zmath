import { useRef } from 'react';
import { AVATARS } from '../../config/avatars.ts';
import type { CustomAvatar } from '../../persistence/types.ts';

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
  customAvatars: CustomAvatar[];
  onUpload: (avatar: CustomAvatar) => void;
  onDeleteCustom: (id: string) => void;
}

const btnStyle = (selected: boolean): React.CSSProperties => ({
  border: selected ? '3px solid blue' : '1px solid #ccc',
  padding: '5px',
  cursor: 'pointer',
  background: selected ? '#e0e8ff' : 'white',
  borderRadius: '6px',
  position: 'relative',
});

const deleteStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  background: '#e00',
  color: 'white',
  border: 'none',
  fontSize: '11px',
  lineHeight: '18px',
  padding: 0,
  cursor: 'pointer',
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

export function AvatarPicker({
  selectedId,
  onSelect,
  customAvatars,
  onUpload,
  onDeleteCustom,
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) return;

    const rawDataUrl = await readFileAsDataUrl(file);
    // Resize to max 128px to keep localStorage small
    const dataUrl = await resizeImage(rawDataUrl, 128);
    const name = file.name.replace(/\.[^.]+$/, '') || 'Avatar';
    const id = `custom-${crypto.randomUUID()}`;

    onUpload({ id, name, dataUrl });
    // Don't call onSelect here — onUpload handler sets avatarId in the same updateSettings call

    // Reset input so the same file can be selected again
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Built-in avatars */}
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            style={btnStyle(selectedId === avatar.id)}
            data-testid={`avatar-${avatar.id}`}
          >
            <img
              src={`assets/images/${avatar.spriteKey}.png`}
              alt={avatar.name}
              width={48}
              height={48}
              style={{ display: 'block' }}
            />
            <div style={{ fontSize: '11px', marginTop: '2px' }}>{avatar.name}</div>
          </button>
        ))}

        {/* Custom avatars */}
        {customAvatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            style={btnStyle(selectedId === avatar.id)}
            data-testid={`avatar-${avatar.id}`}
          >
            <button
              style={deleteStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCustom(avatar.id);
              }}
              data-testid={`delete-avatar-${avatar.id}`}
              title="Smazat"
            >
              x
            </button>
            <img
              src={avatar.dataUrl}
              alt={avatar.name}
              width={48}
              height={48}
              style={{ display: 'block', objectFit: 'cover' }}
            />
            <div style={{ fontSize: '11px', marginTop: '2px' }}>{avatar.name}</div>
          </button>
        ))}

        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #aaa',
            padding: '5px',
            cursor: 'pointer',
            background: '#f8f8f8',
            borderRadius: '6px',
            width: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          data-testid="upload-avatar-btn"
        >
          <span style={{ fontSize: '24px', lineHeight: '32px' }}>+</span>
          <div style={{ fontSize: '10px', color: '#666' }}>Nahrát</div>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="avatar-file-input"
      />
    </div>
  );
}
