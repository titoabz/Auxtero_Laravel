@extends('products.layout')

@section('title', 'Add New Product')

@section('content')
<div class="toolbar">
    <h2>Add New Product</h2>
    <a href="{{ route('products.index') }}" class="btn btn-secondary">← Back to List</a>
</div>

<div class="card">
    <form action="{{ route('products.store') }}" method="POST">
        @csrf
        
        <div class="form-group">
            <label for="name">Product Name *</label>
            <input 
                type="text" 
                name="name" 
                id="name" 
                value="{{ old('name') }}" 
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
                value="{{ old('category') }}"
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
            >{{ old('description') }}</textarea>
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
                value="{{ old('price') }}" 
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
                value="{{ old('quantity', 0) }}" 
                required
            >
            @error('quantity')
                <div class="error-message">{{ $message }}</div>
            @enderror
        </div>

        <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-success">Create Product</button>
            <a href="{{ route('products.index') }}" class="btn btn-secondary">Cancel</a>
        </div>
    </form>
</div>
@endsection
