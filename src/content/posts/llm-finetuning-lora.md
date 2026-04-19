---
title: LLM 微调实战：从 LoRA 到 QLoRA
date: 2026-04-05
tags: [LLM, AI, 微调]
excerpt: 手把手教你如何使用 LoRA 和 QLoRA 技术在消费级 GPU 上微调大语言模型，降低训练成本。
---

## 为什么需要参数高效微调？

全量微调一个 7B 参数的模型需要至少 28GB 显存（FP32），而 LoRA 只需要约 16GB。这使得在消费级 GPU 上微调大模型成为可能。

## LoRA 原理

LoRA (Low-Rank Adaptation) 通过在预训练权重旁添加低秩矩阵来实现微调：

```
W' = W + BA
```

其中 W 是冻结的预训练权重，B 和 A 是可训练的低秩矩阵。

## 使用 PEFT 进行 LoRA 微调

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.float16,
    device_map="auto"
)

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"]
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# 输出: trainable params: 4,194,304 || all params: 6,742,609,920 || trainable%: 0.06%
```

## QLoRA：更极致的节省

QLoRA 通过 4-bit 量化进一步降低显存需求：

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)
```

## 完整训练流程

```python
from transformers import TrainingArguments, Trainer
from datasets import load_dataset

dataset = load_dataset("json", data_files="train.jsonl")

training_args = TrainingArguments(
    output_dir="./lora-output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
)

trainer.train()
```

## 合并与导出

训练完成后，合并 LoRA 权重：

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.float16,
)

model = PeftModel.from_pretrained(base_model, "./lora-output")
merged_model = model.merge_and_unload()

merged_model.save_pretrained("./merged-model")
```

## 性能对比

| 方法 | 显存需求 (7B) | 训练速度 | 效果 |
|------|--------------|---------|------|
| 全量微调 | ~28GB | 慢 | 最佳 |
| LoRA | ~16GB | 快 | 接近全量 |
| QLoRA | ~6GB | 中等 | 略低于 LoRA |

## 总结

LoRA 和 QLoRA 让个人开发者也能参与 LLM 微调。选择哪种方法取决于你的硬件条件和对效果的要求。建议从 QLoRA 开始实验，效果不满意再尝试 LoRA。
