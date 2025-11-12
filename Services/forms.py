# Services/forms.py
from django import forms
from .models import Overview, Package, Question, Gallery, Description

class OverviewForm(forms.ModelForm):
    location_lat = forms.DecimalField(
        max_digits=9, decimal_places=6, required=False,
        widget=forms.HiddenInput()
    )
    location_lng = forms.DecimalField(
        max_digits=9, decimal_places=6, required=False,
        widget=forms.HiddenInput()
    )

    class Meta:
        model = Overview
        fields = ['titleOverview', 'category', 'search_tags', 'location_lat', 'location_lng']
        widgets = {
            'titleOverview': forms.TextInput(attrs={'placeholder': 'e.g. Home Plumbing Repair'}),
            'search_tags': forms.TextInput(attrs={'placeholder': 'plumber, kathmandu, fast, cheap'})
        }

class PackageForm(forms.ModelForm):
    class Meta:
        model = Package
        fields = ['package_type', 'title', 'description', 'delivery_time', 'revisions', 'source_file', 'price']
        widgets = {
            'package_type': forms.HiddenInput(),
            'title': forms.TextInput(attrs={'placeholder': 'e.g. Basic Fix'}),
            'description': forms.Textarea(attrs={'rows': 3}),
            'price': forms.NumberInput(attrs={'min': 50}),
        }

    def __init__(self, *args, **kwargs):
        package_type = kwargs.pop('package_type', None)
        super().__init__(*args, **kwargs)
        if package_type:
            self.fields['package_type'].initial = package_type
            self.fields['price'].widget.attrs['min'] = 50 if package_type == 'basic' else 100 if package_type == 'standard' else 150

class DescriptionForm(forms.ModelForm):
    class Meta:
        model = Description
        fields = ['description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 6, 'placeholder': 'Full service description...'})
        }

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['question_text', 'question_type', 'answer_text', 'choices', 'allow_multiple']
        widgets = {
            'question_text': forms.TextInput(attrs={'placeholder': 'e.g. Do you offer emergency service?'}),
            'answer_text': forms.Textarea(attrs={'rows': 2}),
            'choices': forms.Textarea(attrs={'rows': 2, 'placeholder': 'Option 1\nOption 2'}),
        }

class GalleryForm(forms.ModelForm):
    class Meta:
        model = Gallery
        fields = ['image1', 'image2', 'image3', 'video']