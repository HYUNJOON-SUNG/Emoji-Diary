import torch
from torch import nn
import numpy as np
from transformers import BertModel
from kobert_tokenizer import KoBERTTokenizer

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

class BERTSentenceTransform:
    def __init__(self, tokenizer, max_seq_length, vocab, pad=True, pair=True):
        self._tokenizer = tokenizer
        self._max_seq_length = max_seq_length
        self._pad = pad
        self._pair = pair
        self._vocab = vocab

    def _truncate_seq_pair(self, tokens_a, tokens_b, max_length):
        while True:
            total_length = len(tokens_a) + len(tokens_b)
            if total_length <= max_length:
                break
            if len(tokens_a) > len(tokens_b):
                tokens_a.pop()
            else:
                tokens_b.pop()

    def __call__(self, line):
        text_a = line[0]
        if text_a is None or (isinstance(text_a, float) and np.isnan(text_a)):
            text_a = ""  
        
        text_a = str(text_a)  
        
        text_b = None
        if self._pair and len(line) > 1:
            text_b = line[1]
            if text_b is None or (isinstance(text_b, float) and np.isnan(text_b)):
                text_b = None
            else:
                text_b = str(text_b)

        tokens_a = self._tokenizer.tokenize(text_a)
        tokens_b = None

        if text_b:
            tokens_b = self._tokenizer.tokenize(text_b)

        if tokens_b:
            self._truncate_seq_pair(tokens_a, tokens_b, self._max_seq_length - 3)
        else:
            if len(tokens_a) > self._max_seq_length - 2:
                tokens_a = tokens_a[0:(self._max_seq_length - 2)]

        vocab = self._vocab
        tokens = []
        tokens.append(vocab.cls_token)
        tokens.extend(tokens_a)
        tokens.append(vocab.sep_token)
        segment_ids = [0] * len(tokens)

        if tokens_b:
            tokens.extend(tokens_b)
            tokens.append(vocab.sep_token)
            segment_ids.extend([1] * (len(tokens) - len(segment_ids)))

        input_ids = self._tokenizer.convert_tokens_to_ids(tokens)

        valid_length = len(input_ids)

        if self._pad:
            padding_length = self._max_seq_length - valid_length
            pad_token_id = vocab[vocab.padding_token]
            input_ids.extend([pad_token_id] * padding_length)
            segment_ids.extend([0] * padding_length)

        return np.array(input_ids, dtype='int32'), np.array(valid_length, dtype='int32'), np.array(segment_ids, dtype='int32')

class BERTClassifier(nn.Module):
    def __init__(self, bert, hidden_size=768, num_classes=7, dr_rate=None):
        super(BERTClassifier, self).__init__()
        self.bert = bert
        self.dr_rate = dr_rate
        self.classifier = nn.Linear(hidden_size, num_classes)
        if dr_rate:
            self.dropout = nn.Dropout(p=dr_rate)
    
    def gen_attention_mask(self, token_ids, valid_length):
        attention_mask = torch.zeros_like(token_ids)
        for i, v in enumerate(valid_length):
            attention_mask[i][:v] = 1
        return attention_mask.float()
    
    def forward(self, token_ids, valid_length, segment_ids):
        attention_mask = self.gen_attention_mask(token_ids, valid_length)
        _, pooler = self.bert(input_ids=token_ids, token_type_ids=segment_ids.long(), attention_mask=attention_mask.float().to(token_ids.device))
        if self.dr_rate:
            out = self.dropout(pooler)
        else:
            out = pooler
        return self.classifier(out)

class SimpleVocab:
    def __init__(self, tokenizer):
        self.tokenizer = tokenizer
        self.cls_token = tokenizer.cls_token
        self.sep_token = tokenizer.sep_token
        self.padding_token = tokenizer.pad_token
        self._vocab_dict = tokenizer.get_vocab()
    
    def __getitem__(self, token):
        return self.tokenizer.convert_tokens_to_ids([token])[0] if token in self._vocab_dict else self.tokenizer.unk_token_id

def load_trained_model(model_path='best_model.pt'):
    from transformers import BertModel
    
    bert_base = BertModel.from_pretrained('skt/kobert-base-v1', return_dict=False)
    loaded_model = BERTClassifier(bert_base, dr_rate=0.75, num_classes=7)
    
    loaded_model.load_state_dict(torch.load(model_path, map_location=device))
    loaded_model = loaded_model.to(device)
    loaded_model.eval()  
    
    print(f"✓ 모델 로드 완료: {model_path}")
    return loaded_model

def predict_emotion(model, sentence, tokenizer, vocab, max_len=128):
    emotion_names = ['분노', '슬픔', '불안', '행복', '혐오', '당황', '중립']
    
    transform = BERTSentenceTransform(tokenizer, max_seq_length=max_len, vocab=vocab, pad=True, pair=False)
    token_ids, valid_length, segment_ids = transform([sentence])
    
    if isinstance(token_ids, np.ndarray):
        token_ids = token_ids.tolist()
    if isinstance(segment_ids, np.ndarray):
        segment_ids = segment_ids.tolist()
    
    if isinstance(valid_length, np.ndarray):
        if valid_length.ndim == 0:  
            valid_length_val = int(valid_length.item())
        else:  
            valid_length_val = int(valid_length[0])
    else:
        valid_length_val = int(valid_length)
    
    token_ids = torch.LongTensor([token_ids]).to(device)
    valid_length = torch.LongTensor([valid_length_val]).to(device)  
    segment_ids = torch.LongTensor([segment_ids]).to(device)
    
    model.eval()
    with torch.no_grad():
        output = model(token_ids, valid_length, segment_ids)
        pred = output.argmax(dim=1).item()
        probabilities = torch.softmax(output, dim=1)[0]
    
    emotion = emotion_names[pred]
    confidence = probabilities[pred].item() * 100
    
    return emotion, confidence, probabilities.cpu().numpy()


def initialize_tokenizer_and_vocab():
    tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')
    vocab = SimpleVocab(tokenizer)
    return tokenizer, vocab
