# @translink/plugin-vika

Vika integration plugin for TransLink I18n CLI.

## 📦 Installation

```bash
npm install -D @translink/plugin-vika
# or
pnpm add -D @translink/plugin-vika
```

## ⚙️ Configuration

Configure the plugin in `translink.config.ts`:

```typescript
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // ... other configurations
  plugins: [
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
      },
    ],
  ],
} satisfies I18nConfig;
```

Or use environment variables:

```bash
export VIKA_API_KEY="your_api_key"
export VIKA_DATASHEET_ID="your_datasheet_id"
```

## 🚀 Usage

After configuration, the plugin automatically registers `push` and `pull` commands:

```bash
# Push translations to Vika
npx translink push

# Pull translations from Vika
npx translink pull --language en-US

# Get translation statistics
npx translink stats

# Test connection
npx translink test-connection
```

## ✨ Features

### Cloud-Based Translation Management

- ✅ **Push translations to Vika cloud** - Sync local translations to Vika datasheet
- ✅ **Pull translations from Vika** - Download translations from cloud to local
- ✅ **Real-time collaboration** - Multiple team members can edit simultaneously
- ✅ **Version control** - Track translation changes over time
- ✅ **Translation statistics** - View progress and coverage
- ✅ **Connection testing** - Verify API credentials and connection

### Team Collaboration

Vika plugin enables seamless team collaboration:

1. **Developers** - Push extracted translations to Vika
2. **Translators** - Edit translations in Vika's spreadsheet interface
3. **Operations** - Review and approve translations
4. **Developers** - Pull completed translations back to codebase

## 📖 Commands

### `translink push`

Push local translations to Vika datasheet.

```bash
npx translink push [options]

Options:
  --language <lang>    Only push specified language
  --force             Overwrite existing translations in Vika
  --dry-run           Preview what would be pushed without actually pushing
```

**Example:**

```bash
# Push all languages
npx translink push

# Push only English translations
npx translink push --language en-US

# Preview push without executing
npx translink push --dry-run
```

### `translink pull`

Pull translations from Vika to local files.

```bash
npx translink pull [options]

Options:
  --language <lang>    Only pull specified language
  --force             Overwrite existing local translations
  --merge             Merge with existing translations (default)
```

**Example:**

```bash
# Pull all languages
npx translink pull

# Pull only Japanese translations
npx translink pull --language ja-JP

# Force overwrite local translations
npx translink pull --force
```

### `translink stats`

Get translation statistics from Vika.

```bash
npx translink stats

# Output example:
Translation Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Keys: 150
Languages: 3

Language  Translated  Percentage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
zh-CN     150         100%
en-US     120         80%
ja-JP     90          60%
```

### `translink test-connection`

Test connection to Vika API.

```bash
npx translink test-connection

# Output example:
✓ API Key is valid
✓ Datasheet is accessible
✓ Connection successful
```

## 🔧 Configuration Options

```typescript
interface VikaPluginOptions {
  // Vika API key (required)
  apiKey: string;

  // Vika datasheet ID (required)
  datasheetId: string;

  // API base URL (optional)
  baseUrl?: string;

  // Field mappings (optional)
  fieldMapping?: {
    key?: string; // Translation key column
    context?: string; // Context column
    file?: string; // File path column
    line?: string; // Line number column
    [lang: string]: string; // Language columns
  };

  // Sync options (optional)
  syncOptions?: {
    // Auto-create missing columns
    autoCreateFields?: boolean;

    // Batch size for API requests
    batchSize?: number;

    // Retry configuration
    retry?: {
      maxRetries?: number;
      retryDelay?: number;
    };
  };
}
```

### Complete Configuration Example

```typescript
// translink.config.ts
export default {
  // ... other configurations
  plugins: [
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
        baseUrl: 'https://api.vika.cn',
        fieldMapping: {
          key: 'Translation Key',
          context: 'Context',
          file: 'File Path',
          line: 'Line Number',
          'zh-CN': 'Chinese',
          'en-US': 'English',
          'ja-JP': 'Japanese',
        },
        syncOptions: {
          autoCreateFields: true,
          batchSize: 50,
          retry: {
            maxRetries: 3,
            retryDelay: 1000,
          },
        },
      },
    ],
  ],
};
```

## 🌐 Vika Setup

### 1. Create a Datasheet

1. Log in to [Vika](https://vika.cn)
2. Create a new datasheet
3. Add columns for each language and metadata

### 2. Get API Credentials

1. Go to Account Settings > API Token
2. Create a new API token
3. Copy the token and datasheet ID

### 3. Configure Environment Variables

Create a `.env` file:

```bash
VIKA_API_KEY=your_api_token_here
VIKA_DATASHEET_ID=your_datasheet_id_here
```

## 💡 Best Practices

### Workflow Recommendation

```bash
# 1. Developer extracts new translations
npx translink extract

# 2. Push to Vika for translation
npx translink push

# 3. Translators edit in Vika (no code needed)

# 4. Developer pulls completed translations
npx translink pull

# 5. Build and deploy
npx translink build
```

### Column Structure

Recommended Vika datasheet structure:

| Translation Key | Context     | File Path    | Line | Chinese | English | Japanese |
| --------------- | ----------- | ------------ | ---- | ------- | ------- | -------- |
| abc12345        | Button text | src/App.vue  | 42   | 保存    | Save    | 保存     |
| def67890        | Page title  | src/Home.vue | 15   | 首页    | Home    | ホーム   |

### Security

- **Never commit API keys** to version control
- Use environment variables for sensitive data
- Rotate API tokens regularly
- Limit API token permissions to required datasheets

## 🔍 Troubleshooting

### Common Issues

**Issue: "Invalid API key"**

- Verify your API key is correct
- Check if the token has expired
- Ensure the token has access to the datasheet

**Issue: "Datasheet not found"**

- Verify the datasheet ID
- Check if the datasheet has been deleted
- Ensure the API token has permission to access it

**Issue: "Field not found"**

- Check field mapping configuration
- Verify column names match configuration
- Enable `autoCreateFields` to auto-create missing columns

## 📚 Complete Documentation

- [Plugin Development Guide](../../../docs/guides/plugin-development.md)
- [CLI API Documentation](../../../docs/api/cli.md)
- [Vika API Documentation](https://vika.cn/developers/)

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../../CONTRIBUTING.md).

## 📄 License

MIT © lynncen
