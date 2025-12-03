@extends('products.layout')

@section('title', 'Edit Product')

@section('content')
<div class="toolbar">
    <h2>Edit Product</h2>
    <a href="{{ route('products.index') }}" class="btn btn-secondary">← Back to List</a>
</div>

<div class="card">
    <form action="{{ route('products.update', $product) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div class="form-group">
            <label for="name">Product Name *</label>
            <input 
                type="text" 
                name="name" 
                id="name" 
                value="{{ old('name', $product->name) }}" 
                required
            >
            @error('name')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div class="form-group">
            <label for="category">Category</label>
            <input 
                type="text" 
                name="category" 
                id="category" 
                value="{{ old('category', $product->category) }}"
            >
            @error('category')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div class="form-group">
            <label for="description">Description</label>
            <textarea 
                name="description" 
                id="description"
            >{{ old('description', $product->description) }}</textarea>
            @error('description')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div class="form-group">
            <label for="price">Price ($) *</label>
            <input 
                type="number" 
                name="price" 
                id="price" 
                step="0.01" 
                min="0" 
                value="{{ old('price', $product->price) }}" 
                required
            >
            @error('price')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div class="form-group">
            <label for="quantity">Quantity *</label>
            <input 
                type="number" 
                name="quantity" 
                id="quantity" 
                min="0" 
                value="{{ old('quantity', $product->quantity) }}" 
                required
            >
            @error('quantity')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-success">Update Product</button>
            <a href="{{ route('products.index') }}" class="btn btn-secondary">Cancel</a>
        </div>
    </form>
</div>
@endsection
