import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import toast from 'react-hot-toast';

const PostAd = () => {
  const user = JSON.parse(localStorage.getItem('user')); 
  const userId = user?.id; 

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please upload an image.");
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('image', formData.image);
    data.append('userId', userId); 

    try {
      const response = await fetch('http://localhost:8080/products', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to create ad');
      }

      const result = await response.json();
      console.log('Ad created:', result);
      toast.success('Advertisement posted successfully!');
      setFormData({ title: '', description: '', price: '', image: null });
    } catch (error) {
      console.error(error);
      alert('Error posting advertisement.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4} mb={4}>
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
        <CardHeader title="Post Your Advertisement" />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
            <Box mt={2} mb={2}>
              <Typography variant="body1" gutterBottom>
                Upload Image
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {formData.image && (
                <Typography variant="caption" display="block" mt={1}>
                  Selected: {formData.image.name}
                </Typography>
              )}
            </Box>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Submit Advertisement
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostAd;
